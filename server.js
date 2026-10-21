const APP_VER=(process.env.RENDER_GIT_COMMIT||'')+'-'+Date.now().toString(36);
const crypto=require('crypto');
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||8787, PIN=String(process.env.PIN||(()=>{try{return fs.readFileSync(__dirname+'/pin.txt','utf8')}catch(e){return ''}})()).trim();
if(!PIN)console.warn('WARNING: no PIN set');
const SF=__dirname+'/state.json';
let st={current:0,history:[],seq:0};
try{st=JSON.parse(fs.readFileSync(SF))}catch(e){}
st.preparing=st.preparing||[];st.seenPay=st.seenPay||[];
// coalesced async save: at most one write per ~1.5s, never concurrent; atomic via tmp+rename
let sDirty=false,sTimer=null,sBusy=false;
const SAVE_MS=1500;
const save=()=>{sDirty=true;if(!sTimer&&!sBusy)sTimer=setTimeout(doSave,SAVE_MS)};
async function doSave(){sTimer=null;if(!sDirty)return;sDirty=false;sBusy=true;const tmp=SF+'.tmp';
 try{await fs.promises.writeFile(tmp,JSON.stringify(st));await fs.promises.rename(tmp,SF)}catch(e){console.error('save failed',e.message);sDirty=true}
 finally{sBusy=false;if(sDirty&&!sTimer)sTimer=setTimeout(doSave,SAVE_MS)}}
const saveSync=()=>{if(sTimer){clearTimeout(sTimer);sTimer=null}if(!sDirty)return;sDirty=false;try{fs.writeFileSync(SF+'.tmp2',JSON.stringify(st));fs.renameSync(SF+'.tmp2',SF)}catch(e){console.error('saveSync failed',e.message)}};
process.on('beforeExit',saveSync);
['SIGTERM','SIGINT'].forEach(sig=>process.on(sig,()=>{saveSync();process.exit(0)}));
const clients=new Set();
const pub=()=>{const{seenPay,sqSince,rdySince,calledOrders,kdsLocal,ipad,...o}=st;o.now=Date.now();return o};
const SSE_MAX=1<<20;
const dropClient=(c)=>{clients.delete(c);try{c.end()}catch(e){}try{c.destroy&&c.destroy()}catch(e){}};
const sseWrite=(c,d)=>{try{const so=c.socket||c.connection;if(c.destroyed||c.writableEnded||(so&&so.destroyed)){clients.delete(c);return}
 const ok=c.write(d);if(ok)c._bp=0;else c._bp=(c._bp||0)+1;if(c._bp>=5||c.writableLength>SSE_MAX)dropClient(c)}catch(e){dropClient(c)}};
const push=(ev)=>{const d=`data: ${JSON.stringify({...pub(),event:ev})}\n\n`;[...clients].forEach(c=>sseWrite(c,d));};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.wav':'audio/wav','.mp3':'audio/mpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{
 const u=new URL(q.url,'http://x');
 if(u.pathname.length>1&&u.pathname.endsWith('/'))u.pathname=u.pathname.replace(/\/+$/,'')||'/'; // /order/ -> /order
 if(u.pathname==='/events'){r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});r.write(`data: ${JSON.stringify({...pub(),event:'init'})}\n\n`);clients.add(r);const k=setInterval(()=>{if(clients.has(r))sseWrite(r,':k\n\n');else clearInterval(k)},20000);const rm=()=>{clients.delete(r);clearInterval(k)};q.on('close',rm);r.on('close',rm);r.on('error',rm);q.on('error',rm);return;}
if(u.pathname==='/alog'){if(q.method==='POST'){let d='';q.on('data',c=>{if(d.length<400)d+=c});q.on('end',()=>{ALOG.push(new Date().toISOString().slice(11,19)+' '+d.slice(0,300));if(ALOG.length>200)ALOG.shift();r.writeHead(204);r.end()})}else{r.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});r.end(ALOG.join('\n'))}return;}
if(u.pathname.startsWith('/vc/')){vcServe(u.pathname.slice(4).replace(/\.mp3$/,''),r);return;}
if(u.pathname==='/voice'){voice(u.searchParams.get('n')||'',r,u.searchParams.get('lang'),u.searchParams.get('i'),u.searchParams.get('t'),u.searchParams.get('fx'));return;}
 if(u.pathname==='/api/version'){r.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return r.end(JSON.stringify({v:APP_VER}))}
 if(u.pathname==='/api/menu'){menu().then(m=>{r.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});r.end(JSON.stringify(m))}).catch(e=>{console.error('menu',e.message);r.writeHead(502);r.end('{"error":"menu"}')});return;}
 if(u.pathname==='/square/webhook'&&q.method==='POST'){webhook(q,r);return;}
 if(u.pathname==='/api/checkout'&&q.method==='POST'){let b='';q.on('data',c=>{b+=c;if(b.length>2e4)q.destroy()});q.on('end',()=>checkout(b,q,r));return;}
 if(u.pathname==='/api/order-status'){orderStatus(u.searchParams.get('id')||'',r);return;}
 if(u.pathname.startsWith('/api/kds')){kdsApi(u,q,r);return;}
 if(u.pathname.startsWith('/api/ipad/')){const t0=Date.now();r.on('finish',()=>{if(/worker|uber-(desired|hb)/.test(u.pathname)&&r.statusCode===200)return;ALOG.push(new Date().toISOString().slice(11,19)+' ipad '+q.method+' '+u.pathname.slice(10)+' '+r.statusCode+' '+(Date.now()-t0)+'ms ua='+String(q.headers['user-agent']||'').replace(/^Mozilla\/5\.0 /,'').slice(0,90));if(ALOG.length>200)ALOG.shift()});IPAD(u,q,r);return;}
 if(u.pathname==='/api/fun')return jres(r,200,funState());
 if(u.pathname==='/api/state')return r.end(JSON.stringify(pub()));
 if(u.pathname==='/api/action'&&q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{let j={};try{j=JSON.parse(b)}catch(e){}
  if(String(j.pin)!==PIN){r.writeHead(403);return r.end('{"error":"PIN"}')}
  if(j.action==='check')return r.end('{"ok":true}');
  let ev='call';
  if(j.action==='next'||j.action==='set'){st.callItems=[];st.callFx=null}
  if(j.action==='next')st.current=/^[0-9]{1,4}$/.test(String(st.current))?(+st.current+1)%10000:1; // 9999 -> 0
  else if(j.action==='set'){const n=parseInt(j.number);if(!(n>=0&&n<10000)){r.writeHead(400);return r.end('{}')}st.current=n}
  else if(j.action==='recall'){if(!st.current&&st.current!==0){return r.end('{}')}ev='recall'}
  else if(j.action==='skip'){st.current=/^[0-9]{1,4}$/.test(String(st.current))?(+st.current+1)%10000:1;st.history=[st.current,...st.history.filter(x=>x!==st.current)].slice(0,8);ev='skip'}
  else if(j.action==='reset'){st={current:0,history:[],seq:st.seq,preparing:[],seenPay:st.seenPay,sqSince:st.sqSince,ipad:st.ipad,screenVol:st.screenVol,shop:st.shop};ev='reset'}
  else if(j.action==='callid'){const x=st.preparing.find(y=>y.id===j.id);if(!x)return r.end('{}');{const k=kds.get(x.order);callNum(/^[0-9]+$/.test(String(x.num))?parseInt(x.num):x.num,k?itemsOf(k.raw):[],k&&k.raw)}return r.end(JSON.stringify({ok:true,...pub()}))}
  else if(j.action==='paid'){const x=st.preparing.find(y=>y.id===j.id);if(x)x.unpaid=false;ev='prep'}
  else if(j.action==='done'){st.preparing=st.preparing.filter(x=>x.id!==j.id);ev='prep'}
  else {r.writeHead(400);return r.end('{}')}
  if(ev==='call'){st.preparing=st.preparing.filter(x=>String(x.num)!==String(st.current));st.history=[st.current,...st.history.filter(x=>x!==st.current)].slice(0,8)}
  if(ev==='call'||ev==='recall'){try{st.callClip=callClip(st.current,st.callItems||[],st.callFx)}catch(e){st.callClip=null}}if(ev==='call'&&/^[0-9]{1,4}$/.test(String(st.current)))setTimeout(warmAfter,3000,+st.current);
  st.seq++;st.at=Date.now();if(ev==='call'||ev==='recall')st.callAt=st.at;save();push(ev);r.end(JSON.stringify({ok:true,...pub()}));});return;}
 let p=u.pathname==='/'?'/display.html':u.pathname==='/staff'?'/staff.html':u.pathname==='/ipad'?'/ipad.html':u.pathname==='/display'?'/display.html':u.pathname==='/screen'?'/screen.html':u.pathname==='/screen-test'?'/screen-test.html':u.pathname==='/kds'?'/kds.html':u.pathname==='/order'?'/order.html':u.pathname==='/order/done'?'/order-done.html':u.pathname;
 const f=path.join(__dirname,'public',path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('404')}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':(path.extname(f)==='.html'||p==='/sw.js'||/manifest\.json$/.test(p))?'no-cache':(/^\/voice\/num\/v\d+\//.test(p)||(u.searchParams.has('v')&&/\.(mp3|wav)$/.test(f)))?'public, max-age=31536000, immutable':'public, max-age=3600'});r.end(d)});
}).listen(PORT,'0.0.0.0',()=>console.log('listening',PORT));

// --- Square: auto-add in-store paid orders to "preparing" ---
const TOK=process.env.SQUARE_ACCESS_TOKEN, LOC=process.env.SQUARE_LOCATION_ID||'LM4FNJNN3XFAH';
async function sq(pth,opt={}){const r=await fetch((process.env.SQUARE_API_BASE||'https://connect.squareup.com/v2')+pth,{...opt,headers:{'Authorization':'Bearer '+TOK,'Square-Version':'2025-01-23','Content-Type':'application/json'}});if(!r.ok){const err=new Error('square '+r.status);err.status=r.status;throw err}return r.json()}
let pollMs=3000;
async function poll(){
 try{
  if(!st.sqSince){st.sqSince=new Date().toISOString();save();pollMs=3000;return}
  await checkReady();
  const since=new Date(Date.parse(st.sqSince)-120000).toISOString();
  const d=await sq(`/payments?location_id=${LOC}&begin_time=${encodeURIComponent(since)}&sort_order=ASC&limit=100`);
  const pays=(d.payments||[]).filter(p=>p.status==='COMPLETED'&&!st.seenPay.includes(p.id));
  st.sqSince=new Date().toISOString();
  if(!pays.length){save();pollMs=3000;return}
  const ids=[...new Set(pays.map(p=>p.order_id).filter(Boolean))];
  const od=ids.length?await sq('/orders/batch-retrieve',{method:'POST',body:JSON.stringify({location_id:LOC,order_ids:ids})}):{};
  const om=Object.fromEntries((od.orders||[]).map(o=>[o.id,o]));
  let added=0;
  for(const p of pays){
   st.seenPay.push(p.id);
   const o=om[p.order_id];if(!o)continue;
   const src=((o.source&&o.source.name)||'');
   if(/uber|giftcard/i.test(src))continue; // exclude only Uber Eats and gift card sales; POS + Kiosk self-order included

   if(st.preparing.some(x=>x.order===o.id))continue;
   const num=await labelOf(o);
   const w=st.preparing.find(x=>x.web&&x.unpaid&&String(x.num)===String(num));
   if(w){w.unpaid=false;w.paidOrder=o.id;added++;continue}
   st.preparing.push({id:p.id,order:o.id,num,items:(o.line_items||[]).map(l=>l.name+(l.quantity!=='1'?'×'+l.quantity:'')).join('、'),at:Date.now()});added++;
  }
  st.seenPay=st.seenPay.slice(-1000);
  st.preparing=st.preparing.filter(x=>Date.now()-x.at<3*3600e3);
  save();if(added){st.seq++;push('prep')}pollMs=3000;
 }catch(e){console.error('square poll',e.message);if(e.status===429||/\b429\b/.test(e.message)){pollMs=10000;console.log('square 429, backoff to 10s')}}
}
function tickPoll(){poll().finally(()=>setTimeout(tickPoll,pollMs))}
if(TOK){kdsSeed().finally(tickPoll);console.log('square polling on (3s, backoff 10s on 429)')}

// auto-call when Square marks a tracked order ready/completed
const itemsOf=o=>((o&&o.line_items)||[]).map(l=>({n:l.name,q:parseInt(l.quantity)||1}));
function callNum(num,items,o){
 // fun fx (birthday / milestone / regular) computed before the call is pushed; never blocks >1.5s, never throws
 let fx={};try{fx=cupFx(o,items)}catch(e){}
 const go=()=>{try{st.callFx=Object.keys(fx).length?fx:null}catch(e){}callNum0(num,items)};
 if(o&&o.customer_id&&TOK)withTimeout(custFx(o),1500).then(c=>{Object.assign(fx,c||{})}).catch(()=>{}).finally(go);else go();
}
function callNum0(num,items){st.current=num;st.callItems=(items||[]).slice(0,10);try{st.callClip=callClip(num,st.callItems,st.callFx)}catch(e){st.callClip=null}try{if(/^[0-9]{1,4}$/.test(String(num)))setTimeout(warmAfter,3000,+num)}catch(e){}st.preparing=st.preparing.filter(x=>String(x.num)!==String(num));st.history=[num,...st.history.filter(x=>String(x)!==String(num))].slice(0,8);st.seq++;st.at=Date.now();st.callAt=st.at;save();push('call')}
async function labelOf(o){
 const rec=((o.fulfillments||[]).map(f=>((f.delivery_details||f.pickup_details||{}).recipient||{}).display_name).find(Boolean)||'').trim();
 let label=(o.ticket_name||'').trim()||rec||o.id.slice(-4);
 if(/^[0-9]+$/.test(label)&&o.customer_id){const fam=await familyName(o.customer_id);if(fam)label=fam}
 return label.replace(/[<>&"'`\\]/g,'').slice(0,24);
}
// shared auto-call decision (used by the 3s poll and the webhook); returns true if it called
async function tryCall(o){
 st.calledOrders=st.calledOrders||[];
 if(!o||o.state==='CANCELED')return false;
 if(st.calledOrders.includes(o.id))return false;
 const src=((o.source&&o.source.name)||'');if(/uber|giftcard/i.test(src))return false;
 const fdone=(o.fulfillments||[]).some(f=>f.state==='PREPARED'||f.state==='COMPLETED');
 // mobile orders: only the pickup fulfillment going PREPARED/COMPLETED counts (payment alone must not trigger a call)
 const done=o.reference_id==='mstand-web'?fdone:(o.state==='COMPLETED'||fdone);
 if(!done)return false;
 if(Date.now()-Date.parse(o.created_at)>3*3600e3)return false; // ignore old tickets being cleaned up
 if(Date.parse(o.updated_at)-Date.parse(o.created_at)<45000)return false; // auto-closed at checkout, not a real "ready"
 st.calledOrders.push(o.id);st.calledOrders=st.calledOrders.slice(-500); // mark before any await: no double call
 const x=st.preparing.find(y=>y.order===o.id||y.paidOrder===o.id);
 const lab=x?x.num:await labelOf(o);
 st.preparing=st.preparing.filter(y=>y.order!==o.id&&y.paidOrder!==o.id);
 console.log('auto-call order');callNum(/^[0-9]+$/.test(String(lab))?parseInt(lab):lab,itemsOf(o),o);save();
 return true;
}
// --- Square webhook: instant call on order.updated / order.fulfillment.updated ---
const WH_KEY=process.env.SQUARE_WEBHOOK_SIGNATURE_KEY||'';
const WH_URL=process.env.SQUARE_WEBHOOK_URL||'https://mstand-queue.onrender.com/square/webhook';
function whValid(raw,sig){
 if(!WH_KEY||!sig)return false;
 const exp=crypto.createHmac('sha256',WH_KEY).update(WH_URL+raw).digest('base64');
 const a=Buffer.from(exp),b=Buffer.from(String(sig));
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
function webhook(q,r){
 const ch=[];let n=0;
 q.on('data',c=>{n+=c.length;if(n>1e6){q.destroy();return}ch.push(c)});
 q.on('end',()=>{
  const raw=Buffer.concat(ch).toString('utf8');
  if(!whValid(raw,q.headers['x-square-hmacsha256-signature'])){r.writeHead(403);return r.end()}
  r.writeHead(200);r.end();
  let ev={};try{ev=JSON.parse(raw)}catch(e){return}
  if(ev.type!=='order.updated'&&ev.type!=='order.fulfillment.updated')return;
  const d=ev.data||{},id=d.id||(((d.object||{})[ev.type==='order.updated'?'order_updated':'order_fulfillment_updated'])||{}).order_id;
  if(!id||!TOK)return;
  (async()=>{const j=await sq('/orders/'+encodeURIComponent(id));const o=j.order;
   if(!o||(o.location_id&&o.location_id!==LOC))return;
   try{await kdsUpsert(o)}catch(e){}
   await tryCall(o);
  })().catch(e=>console.error('webhook',e.message));
 });
}
// Auto-call: search ALL orders updated recently (not only tracked ones), so it works after
// a server restart and regardless of which device (phone / Register) marked it done.
async function checkReady(){
 st.calledOrders=st.calledOrders||[];
 const now=new Date().toISOString();
 if(!st.rdySince){st.rdySince=now;save();return}
 const since=new Date(Date.parse(st.rdySince)-120000).toISOString();
 const body={location_ids:[LOC],limit:100,query:{filter:{date_time_filter:{updated_at:{start_at:since}},state_filter:{states:['OPEN','COMPLETED','CANCELED']}},sort:{sort_field:'UPDATED_AT',sort_order:'ASC'}}};
 const od=await sq('/orders/search',{method:'POST',body:JSON.stringify(body)});
 st.rdySince=now;
 for(const o of (od.orders||[]))await kdsUpsert(o);
 for(const o of (od.orders||[])){if(await tryCall(o))await new Promise(r=>setTimeout(r,8000))}
 save();
}

// --- voice: edge neural TTS -> Google TTS -> generic clip; ?lang=ja,zh,en ---
const {MsEdgeTTS,OUTPUT_FORMAT}=require('msedge-tts');
const t2s=require('opencc-js').Converter({from:'tw',to:'cn'});
const VOICES={ja:'ja-JP-NanamiNeural',zh:'zh-CN-XiaoxiaoNeural',en:'en-US-JennyNeural'};
const GTL={ja:'ja',zh:'zh-CN',en:'en'};
const DEFAULT_LANGS=(process.env.VOICE_LANGS||'ja,zh,en');
let GAP=null;try{GAP=fs.readFileSync(path.join(__dirname,'public','gap.mp3'))}catch(e){}
const vcache=new Map(),acache=new Map(),vinf=new Map(),ALOG=[];
function cput(m,k,v){m.set(k,v);if(m.size>300)m.delete(m.keys().next().value)}
function parseLangs(q){const out=[];String(q||DEFAULT_LANGS).split(',').forEach(x=>{x=x.trim().toLowerCase();if(VOICES[x]&&!out.includes(x))out.push(x)});return out.length?out:['ja']}
const VT=require('./voicetext');const phrase=(n,lang,items)=>VT.phrase(n,lang,items);
function withTimeout(p,ms){return Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))])}
async function edgeTTS(text,lang){
 const t=new MsEdgeTTS();
 try{await t.setMetadata(VOICES[lang],OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const b=await new Promise((res,rej)=>{const {audioStream}=t.toStream(text,VT.prosody(text,lang));const c=[];audioStream.on('data',d=>c.push(d));audioStream.on('error',rej);audioStream.on('close',()=>res(Buffer.concat(c)))});
  if(b.length<1000)throw new Error('edge short');return b;
 }finally{try{t.close()}catch(e){}}
}
async function googleTTS(text,lang){
 const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),6000);
 try{const x=await fetch('https://translate.google.com/translate_tts?ie=UTF-8&tl='+GTL[lang]+'&client=tw-ob&q='+encodeURIComponent(text),{headers:{'User-Agent':'Mozilla/5.0'},signal:ctl.signal});
  if(!x.ok)throw new Error('tts '+x.status);const b=Buffer.from(await x.arrayBuffer());if(b.length<1000)throw new Error('tts short');return b}finally{clearTimeout(to)}
}
async function segment(n,lang,items,kind,fx){
 const text=kind==='thanks'?VT.thanks(n,lang):VT.withFx(phrase(n,lang,items),lang,fx),k=lang+'|'+text;
 if(vcache.has(k))return vcache.get(k);
 if(vinf.has(k))return vinf.get(k);
 const pr=segGen(text,lang,k);vinf.set(k,pr);try{return await pr}finally{vinf.delete(k)}
}
async function segGen(text,lang,k){
 let b=null;
 try{b=await withTimeout(edgeTTS(text,lang),7000)}catch(e){console.error('voice edge',lang,e.message)}
 if(!b){try{b=await googleTTS(text,lang)}catch(e){console.error('voice google',lang,e.message)}}
 if(b)cput(vcache,k,b);return b;
}
// --- call clip pre-generation: built the moment an order is called, served instantly from /vc/<hash>.mp3 ---
const os=require('os');const VC_DIR=process.env.VC_DIR||path.join(os.tmpdir(),'mstand-vc');try{fs.mkdirSync(VC_DIR,{recursive:true})}catch(e){}
const VC_MAX=60*1024*1024;let vcBytes=0;const vcMem=new Map(),vcJob=new Map(),vcMeta=new Map();
function vcPut(h,b){if(vcMem.has(h)){vcBytes-=vcMem.get(h).length;vcMem.delete(h)}vcMem.set(h,b);vcBytes+=b.length;
 while(vcBytes>VC_MAX&&vcMem.size>1){const k=vcMem.keys().next().value;vcBytes-=vcMem.get(k).length;vcMem.delete(k)}}
function vcGet(h){const b=vcMem.get(h);if(b){vcMem.delete(h);vcMem.set(h,b)}return b} // LRU touch
// disk LRU: cap file count, drop oldest mtime
function vcDiskTrim(){fs.readdir(VC_DIR,(e,fl)=>{if(e||fl.length<=3000)return;const a=fl.map(f=>{try{return [f,fs.statSync(path.join(VC_DIR,f)).mtimeMs]}catch(e){return [f,0]}}).sort((x,y)=>x[1]-y[1]);a.slice(0,a.length-2500).forEach(x=>fs.unlink(path.join(VC_DIR,x[0]),()=>{}))})}
const itemsQOf=items=>(items||[]).map(x=>String(x.n).replace(/[|*]/g,'')+'*'+x.q).join('|');
const fxQOf=fx=>{if(!fx)return '';const a=[];if(fx.bday)a.push('bday');if(fx.ms)a.push('ms'+fx.ms);if(fx.life)a.push('life'+fx.life);if(fx.reg)a.push('reg'+fx.reg);return a.join(',')};
function vcKey(n,langQ,itemsQ,kind,fxQ){const langs=parseLangs(langQ);return langs.join(',')+'|'+String(n).trim().slice(0,24)+'|'+String(itemsQ||'').slice(0,300)+'|'+(kind==='thanks'?'thanks':'call')+'|'+VT.fxKey(VT.parseFx(fxQ))}
async function buildClip(n,langQ,itemsQ,kind,fxQ){
 const fx=VT.parseFx(fxQ);kind=kind==='thanks'?'thanks':'call';const items=VT.parseItems(itemsQ),langs=parseLangs(langQ);
 const key=vcKey(n,langQ,itemsQ,kind,fxQ);if(acache.has(key))return acache.get(key);
 const parts=(await Promise.all(langs.map(l=>segment(n,l,items,kind,fx)))).filter(Boolean);
 if(!parts.length)return null;const out=[];parts.forEach((p,i)=>{if(i&&GAP)out.push(GAP);out.push(p)});
 const b=Buffer.concat(out);cput(acache,key,b);return b;
}
// returns {h, url}; starts generation (memory+disk) immediately, dedupes in-flight
function pregen(n,items,fx,langQ){
 const iq=itemsQOf(items),fq=fxQOf(fx),key=vcKey(n,langQ,iq,'call',fq),h=crypto.createHash('sha1').update('v3|'+key).digest('hex').slice(0,20);
 vcMeta.set(h,{n,iq,fq,langQ});if(vcMeta.size>2000)vcMeta.delete(vcMeta.keys().next().value);
 if(!vcMem.has(h)&&!vcJob.has(h)){const t0=Date.now();
  const pr=(async()=>{const f=path.join(VC_DIR,h+'.mp3');
   try{const d=await fs.promises.readFile(f);vcPut(h,d);fs.utimes(f,new Date(),new Date(),()=>{});return d}catch(e){}
   const b=await buildClip(n,langQ,iq,'call',fq);
   if(b){vcPut(h,b);fs.writeFile(f,b,()=>vcDiskTrim());console.log('vc pregen',h,b.length+'B',(Date.now()-t0)+'ms')}
   return b})().finally(()=>vcJob.delete(h));
  vcJob.set(h,pr);pr.catch(()=>{});
 }
 return {h,url:'/vc/'+h+'.mp3'};
}
async function vcServe(h,r){
 const send=(b,src)=>{ALOG.push(new Date().toISOString().slice(11,19)+' srv vc '+src+' '+h.slice(0,8));if(ALOG.length>200)ALOG.shift();
  r.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':b.length,'Cache-Control':'public, max-age=31536000, immutable'});r.end(b)};
 if(!/^[0-9a-f]{20}$/.test(h)){r.writeHead(404);return r.end()}
 let b=vcGet(h);if(b)return send(b,'HIT-mem');
 if(vcJob.has(h)){try{b=await vcJob.get(h)}catch(e){}if(b)return send(b,'HIT-inflight')}
 try{b=await fs.promises.readFile(path.join(VC_DIR,h+'.mp3'));vcPut(h,b);return send(b,'HIT-disk')}catch(e){}
 const m=vcMeta.get(h);if(m){pregen(m.n,VT.parseItems(m.iq),VT.parseFx(m.fq),m.langQ);try{b=await vcJob.get(h)}catch(e){}if(b)return send(b,'MISS-gen')}
 fs.readFile(path.join(__dirname,'public','voice_fallback.mp3'),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':d.length,'Cache-Control':'no-store'});r.end(d)});
}
// static pre-recorded number clips (public/voice/num/v1/<n>.mp3) for number-only calls with default langs
const NUM_V='v2';let NUM_MIN=1,NUM_MAX=0;try{const m=JSON.parse(fs.readFileSync(path.join(__dirname,'public','voice','num',NUM_V,'manifest.json')));NUM_MIN=m.min||0;NUM_MAX=m.max||0}catch(e){}
function callClip(n,items,fx){
 const plain=(!items||!items.length)&&!fxQOf(fx);
 if(plain&&/^[0-9]+$/.test(String(n))&&+n>=NUM_MIN&&+n<=NUM_MAX&&String(+n)===String(n)&&DEFAULT_LANGS==='ja,zh,en')return {url:'/voice/num/'+NUM_V+'/'+n+'.mp3',langs:'ja,zh,en',src:'static'};
 const p=pregen(n,items,fx,DEFAULT_LANGS);return {url:p.url,langs:parseLangs(DEFAULT_LANGS).join(','),src:'pregen'};
}
// startup warm: tickets cycle 0-9999 (9999 -> 0). Warm the next numbers after the most recent call(s) and anything preparing,
// modulo 10000, skipping the static range. Re-run every 10 min so a long day keeps the window ahead of the counter.
const isStaticNum=i=>i>=NUM_MIN&&i<=NUM_MAX&&DEFAULT_LANGS==='ja,zh,en';
function warmNums(){try{const num=x=>/^[0-9]{1,4}$/.test(String(x))?+x:null;
 const bases=[num(st.current)].concat((st.history||[]).slice(0,2).map(num),(st.preparing||[]).map(x=>num(x.num))).filter(x=>x!==null);
 const seen=new Set(),list=[];bases.forEach(b=>{for(let d=-2;d<=40;d++){const i=((b+d)%10000+10000)%10000;if(!seen.has(i)&&!isStaticNum(i)){seen.add(i);list.push(i)}}});
 const todo=list.slice(0,120);todo.forEach(warmQ);console.log('vc warm',todo.length,'numbers from',todo[0])}catch(e){console.error('warm',e.message)}}
// sequential warm queue (one clip at a time, low priority) so a burst never opens dozens of TTS sockets
const wq=[],wqSet=new Set();let wqRun=false;
function warmQ(i){if(isStaticNum(i)||wqSet.has(i))return;wqSet.add(i);wq.push(i);if(!wqRun)wqNext()}
function wqNext(){const i=wq.shift();if(i===undefined){wqRun=false;return}wqRun=true;wqSet.delete(i);
 let p;try{p=pregen(i,[],null,DEFAULT_LANGS)}catch(e){}Promise.resolve(p&&vcJob.get(p.h)).catch(()=>{}).finally(()=>setTimeout(wqNext,300))}
function warmAfter(b){for(let d=1;d<=15;d++)warmQ((b+d)%10000)}
setTimeout(warmNums,5000);setInterval(warmNums,10*60e3);
async function voice(n,r,langQ,itemsQ,kind,fxQ){
 const fx=VT.parseFx(fxQ);kind=kind==='thanks'?'thanks':'call';
 const items=VT.parseItems(itemsQ);
 const send=(b)=>{r.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':b.length,'Cache-Control':'public, max-age=86400'});r.end(b)};
 const fb=()=>fs.readFile(path.join(__dirname,'public','voice_fallback.mp3'),(e,d)=>{if(e){r.writeHead(404);return r.end()}send(d)});
 if(!n&&kind!=='thanks')return fb();
 const langs=parseLangs(langQ),key=langs.join(',')+'|'+String(n).trim().slice(0,24)+'|'+String(itemsQ||'').slice(0,300)+'|'+kind+'|'+VT.fxKey(fx);
 if(acache.has(key))return send(acache.get(key));
 try{
  const parts=(await Promise.all(langs.map(l=>segment(n,l,items,kind,fx)))).filter(Boolean);
  if(!parts.length)return fb();
  const out=[];parts.forEach((p,i)=>{if(i&&GAP)out.push(GAP);out.push(p)});
  const b=Buffer.concat(out);cput(acache,key,b);send(b);
 }catch(e){console.error('voice',e.message);fb()}
}

// POS orders with linked customer: show family name only (cached, never logged)
const famCache=new Map(); // full name (family + given), never logged
async function familyName(id){
 if(famCache.has(id))return famCache.get(id);
 let f='';
 try{const c=await sq('/customers/'+encodeURIComponent(id));const cu=c.customer||{};f=[(cu.family_name||'').trim(),(cu.given_name||'').trim()].filter(Boolean).join(' ')}catch(e){console.error('customer lookup failed');return ''}
 famCache.set(id,f);if(famCache.size>500)famCache.delete(famCache.keys().next().value);
 return f;
}

// --- Mobile order: live menu (cached) + Square Checkout payment links ---
let menuC={at:0,data:null},menuP=null;
// Fast change check: every 15s ask Square only for catalog objects changed since the last seen
// updated_at (1 tiny request, limit 1). If anything changed (e.g. sold-out toggled), drop the cache
// and rebuild in the background so the next /api/menu is fresh. Full rebuild still at most every 5 min otherwise.
let catSince=new Date(Date.now()-60e3).toISOString(),menuLastReq=0;
async function catCheck(){
 if(!TOK||Date.now()-menuLastReq>30*60e3)return; // nobody looking at menus -> skip
 try{const d=await sq('/catalog/search',{method:'POST',body:JSON.stringify({object_types:['ITEM','ITEM_VARIATION','MODIFIER_LIST','MODIFIER'],begin_time:catSince,include_deleted_objects:true,limit:100})});
  const o=d.objects||[];if(!o.length)return;
  o.forEach(x=>{if(x.updated_at&&x.updated_at>catSince)catSince=x.updated_at});
  console.log('catalog changed ('+o.length+'), refreshing menu');menuC.at=0;menu().catch(()=>{});
 }catch(e){console.error('catCheck',e.message)}
}
setInterval(catCheck,15e3);
async function menu(){
 menuLastReq=Date.now();
 if(menuC.data&&Date.now()-menuC.at<5*60e3)return menuC.data;
 if(menuP)return menuP;
 menuP=menuBuild().finally(()=>{menuP=null});return menuP;
}
const MODORD=n=>{const i=['トッピング','甘さ','氷の量'].indexOf(n);return i<0?9:i};
async function menuBuild(){
 let objs=[],cur;do{const d=await sq('/catalog/list?types=ITEM,CATEGORY,IMAGE,MODIFIER_LIST'+(cur?'&cursor='+encodeURIComponent(cur):''));objs=objs.concat(d.objects||[]);cur=d.cursor}while(cur);
 const img={},cat={};objs.forEach(o=>{if(o.type==='IMAGE')img[o.id]=o.image_data.url;if(o.type==='CATEGORY')cat[o.id]=o.category_data.name});
 const at0=o=>(o.present_at_all_locations||(o.present_at_location_ids||[]).includes(LOC))&&!(o.absent_at_location_ids||[]).includes(LOC);
 const ml={};objs.forEach(o=>{if(o.type!=='MODIFIER_LIST'||o.is_deleted||!at0(o))return;const d=o.modifier_list_data;
  ml[o.id]={id:o.id,name:d.name||'',multi:d.selection_type!=='SINGLE',opts:(d.modifiers||[]).filter(m=>!m.is_deleted&&at0(m)).map(m=>({id:m.id,name:m.modifier_data.name||'',price:Number((m.modifier_data.price_money||{}).amount||0),so:(m.modifier_data.location_overrides||[]).some(l=>l.location_id===LOC&&l.sold_out)}))}});
 const at=o=>(o.present_at_all_locations||(o.present_at_location_ids||[]).includes(LOC))&&!(o.absent_at_location_ids||[]).includes(LOC);
 const items=[];
 for(const o of objs){if(o.type!=='ITEM'||o.is_deleted||!at(o))continue;const d=o.item_data;
  if(d.product_type==='GIFT_CARD'||/ギフト|gift/i.test(d.name))continue;
  const vars=(d.variations||[]).filter(v=>at(v)&&v.item_variation_data.price_money).map(v=>({id:v.id,name:v.item_variation_data.name||'',price:Number(v.item_variation_data.price_money.amount),so:(v.item_variation_data.location_overrides||[]).some(l=>l.location_id===LOC&&l.sold_out)}));
  if(!vars.length)continue;
  const c=(d.categories||[]).map(x=>cat[x.id]).find(Boolean)||cat[d.category_id]||'その他';
  items.push({id:o.id,name:d.name,cat:c,desc:(d.description_plaintext||'').split('\n')[0].slice(0,40),img:img[(d.image_ids||[])[0]]||'',vars,mods:(d.modifier_list_info||[]).filter(x=>x.enabled!==false&&ml[x.modifier_list_id]&&ml[x.modifier_list_id].opts.length).map(x=>{const L=ml[x.modifier_list_id];return {...L,min:Math.max(0,x.min_selected_modifiers>0?x.min_selected_modifiers:0),max:x.max_selected_modifiers>0?x.max_selected_modifiers:(L.multi?L.opts.length:1)}}).sort((a,b)=>MODORD(a.name)-MODORD(b.name)),so:vars.every(v=>v.so)});}
 menuC={at:Date.now(),data:items};return items;
}
const cleanName=s=>String(s||'').replace(/[<>&"'`\\\u0000-\u001f]/g,'').trim().slice(0,20);
const rl=new Map(); // ip -> [timestamps]
function limited(ip){const now=Date.now(),a=(rl.get(ip)||[]).filter(t=>now-t<10*60e3);if(a.length>=3){rl.set(ip,a);return true}a.push(now);rl.set(ip,a);if(rl.size>5000)rl.delete(rl.keys().next().value);return false}
// --- Anti-prank limits (env-configurable) ---
const envInt=(k,d)=>{const v=parseInt(process.env[k]);return v>0?v:d};
const AP={cups:envInt('ORDER_MAX_CUPS',10),yen:envInt('ORDER_MAX_YEN',20000),devMin:envInt('ORDER_DEVICE_WINDOW_MIN',3),devMax:envInt('ORDER_DEVICE_MAX_OPEN',1),
 burstN:envInt('ORDER_BURST_MAX',8),burstMin:envInt('ORDER_BURST_WINDOW_MIN',5),burstBlockMin:envInt('ORDER_BURST_BLOCK_MIN',10),nameMax:envInt('ORDER_NAME_MAX',20)};
const webRecent=[]; // {id,ip,dev,at}
let burstUntil=0;
function nameCheck(raw){const n=String(raw||'').replace(/[<>&"'`\\\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim();
 if(!n)return {err:'name'};return {n:Array.from(n).slice(0,AP.nameMax).join('')}}
function webOpen(id){const p=st.preparing.find(x=>x.order===id);return !!(p&&p.unpaid)}
async function checkout(b,q,r){
 if(st.shop&&st.shop.mode&&process.env.SHOP_GATE_ORDER!=='0')return jres(r,409,{error:'closed',mode:st.shop.mode}); // QR self-order paused while not 営業中
 const bad=(c,m)=>{r.writeHead(c,{'Content-Type':'application/json'});r.end(JSON.stringify({error:m}))};
 try{
  let j;try{j=JSON.parse(b)}catch(e){return bad(400,'json')}
  const nc=nameCheck(j.name);if(nc.err)return bad(400,nc.err);const name=nc.n;
  const m=await menu();const vm={};m.forEach(i=>i.vars.forEach(v=>{vm[v.id]={...v,mods:i.mods||[]}}));
  const raw=(Array.isArray(j.items)?j.items:[]).filter(x=>vm[x.v]).slice(0,30);
  if(raw.some(x=>vm[x.v].so))return bad(409,'soldout');
  const lines=[];for(const x of raw){const v=vm[x.v],om={};v.mods.forEach(L=>L.opts.forEach(o=>{om[o.id]={o,L}}));
   const ids=[...new Set((Array.isArray(x.m)?x.m:[]).map(String))].slice(0,10);
   if(ids.some(id=>!om[id]))return bad(400,'items');if(ids.some(id=>om[id].o.so))return bad(409,'soldout');
   for(const L of v.mods){const n=ids.filter(id=>om[id].L.id===L.id).length;if(n>L.max)return bad(400,'items')}
   const qn=Math.min(20,Math.max(1,parseInt(x.q)||1)),l={catalog_object_id:x.v,quantity:String(qn)};
   if(ids.length)l.modifiers=ids.map(id=>({catalog_object_id:id,quantity:'1'}));l._yen=(v.price+ids.reduce((a,id)=>a+om[id].o.price,0))*qn;lines.push(l)}
  if(!lines.length)return bad(400,'items');
  const ip=String(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim();
  if(limited(ip))return bad(429,'rate');
  const now=Date.now();while(webRecent.length&&now-webRecent[0].at>Math.max(AP.devMin,AP.burstMin)*60e3)webRecent.shift();
  const cups=lines.reduce((a,l)=>a+parseInt(l.quantity),0),yen=lines.reduce((a,l)=>a+l._yen,0);lines.forEach(l=>delete l._yen);
  if(cups>AP.cups||yen>AP.yen)return bad(400,'cap');
  const dev=String(j.dev||'').replace(/[^a-z0-9-]/gi,'').slice(0,40);
  const mine=webRecent.filter(w=>now-w.at<AP.devMin*60e3&&(w.ip===ip||dev&&w.dev===dev));
  if(mine.length>=AP.devMax)return bad(429,'device');
  if(now<burstUntil)return bad(503,'busy');
  if(webRecent.filter(w=>now-w.at<AP.burstMin*60e3).length>=AP.burstN){burstUntil=now+AP.burstBlockMin*60e3;console.warn('phone order burst guard on');return bad(503,'busy')}
  if(process.env.ORDER_DRY_RUN==='1'){const id='DRY'+now.toString(36).toUpperCase();webRecent.push({id,ip,dev,at:now});st.preparing.push({id:'web-'+id,order:id,num:name,no:shortNo(id),unpaid:true,web:true,items:'(dry-run)',total:yen,at:now});return jres(r,200,{order_id:id,no:shortNo(id),dry:true})}
  const body={idempotency_key:require('crypto').randomUUID(),
   order:{location_id:LOC,state:'OPEN',source:{name:'M Stand スマホ注文'},ticket_name:name,reference_id:'mstand-web',line_items:lines,
    fulfillments:[{type:'PICKUP',state:'PROPOSED',pickup_details:{recipient:{display_name:name},schedule_type:'ASAP',prep_time_duration:'PT10M',note:'スマホ注文（レジで支払い）'}}]}};
  const o=(await sq('/orders',{method:'POST',body:JSON.stringify(body)})).order||{};
  const no=shortNo(o.id);webRecent.push({id:o.id,ip,dev,at:Date.now()});
  // Unpaid API orders are NOT visible in Square POS, so list it on the queue right away (marked unpaid)
  if(!st.preparing.some(x=>x.order===o.id)){st.preparing.push({id:'web-'+o.id,order:o.id,num:name,no,unpaid:true,web:true,items:(o.line_items||[]).map(l=>l.name+(l.variation_name?'('+l.variation_name+')':'')+(l.quantity!=='1'?'×'+l.quantity:'')).join('、'),total:Number((o.total_money||{}).amount||0),at:Date.now()});st.seq++;save();push('prep')}
  r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify({order_id:o.id,no}));
 }catch(e){console.error('checkout',e.message);bad(502,'square')}
}
const shortNo=id=>'W'+String(id||'').replace(/[^A-Z0-9]/gi,'').slice(-4).toUpperCase();
async function orderStatus(id,r){
 r.setHeader('Content-Type','application/json');
 if(!/^[A-Za-z0-9]{10,40}$/.test(id)){r.writeHead(400);return r.end('{}')}
 try{const o=(await sq('/orders/'+id)).order||{};if(o.location_id!==LOC||o.reference_id!=='mstand-web'){r.writeHead(404);return r.end('{}')}
  const f=(o.fulfillments||[])[0]||{};
  r.end(JSON.stringify({no:shortNo(o.id),name:cleanName(o.ticket_name),paid:o.state==='COMPLETED'||!!(o.tenders||[]).length||Number((o.net_amount_due_money||{}).amount)===0&&Number((o.total_money||{}).amount)>0,state:f.state||o.state,total:Number((o.total_money||{}).amount||0),items:(o.line_items||[]).map(l=>({n:l.name,v:l.variation_name,q:l.quantity}))}))}
 catch(e){r.writeHead(502);r.end('{}')}
}

// --- KDS: kitchen display fed by the existing Square poll (checkReady) + one seed search at startup ---
const KDS_KEY=String(process.env.KDS_KEY||'').trim();
const kds=new Map();
function kdsLoc(){st.kdsLocal=st.kdsLocal||{};return st.kdsLocal}
function kdsSrc(o){const n=((o.source&&o.source.name)||'');if(/giftcard/i.test(n))return null;if(/uber/i.test(n))return 'Uber';if(o.reference_id==='mstand-web')return '手机点单';if(/kiosk|セルフ|self/i.test(n))return '自助';return '店头'}
function pickupF(o){const fs=o.fulfillments||[];return fs.find(f=>f.type==='PICKUP')||fs[0]||null}
async function kdsUpsert(o){
 const src=kdsSrc(o);if(!src){kds.delete(o.id);return}
 if(Date.now()-Date.parse(o.created_at)>16*3600e3){kds.delete(o.id);return}
 const f=pickupF(o);const fs=f?f.state:'';
 const state=o.state==='CANCELED'||fs==='CANCELED'?'CANCELED':o.state==='COMPLETED'||fs==='COMPLETED'?'COMPLETED':fs==='PREPARED'?'PREPARED':'OPEN';
 if(state==='CANCELED'){kds.delete(o.id);delete kdsLoc()[o.id];return}
 // local override: Square fulfillment states are forward-only (no PREPARED->RESERVED) and POS-made orders can't be updated via API
 const lo=kdsLoc()[o.id];let st2=state;
 if(state==='COMPLETED'){delete kdsLoc()[o.id]}else if(lo==='open')st2='OPEN';else if(lo==='done'&&state==='OPEN')st2='PREPARED';
 const old=kds.get(o.id);
 const name=old&&old.name||await labelOf(o);
 const pd=f&&(f.pickup_details||f.delivery_details)||{};
 kds.set(o.id,{id:o.id,name,source:src,readonly:src==='Uber',created_at:o.created_at,updated_at:old&&old.state!==st2?new Date().toISOString():o.updated_at,state:st2,raw:o,note:(pd.note||o.note||'').slice(0,200),
  items:(o.line_items||[]).map(l=>({name:l.name,qty:l.quantity,variation:l.variation_name||'',mods:(l.modifiers||[]).map(m=>m.name),note:l.note||''}))});
 if(kds.size>400){const a=[...kds.values()].sort((x,y)=>Date.parse(x.created_at)-Date.parse(y.created_at));kds.delete(a[0].id)}
}
async function kdsSeed(){try{
 const d=new Date(Date.now()+9*3600e3);d.setUTCHours(0,0,0,0);const start=new Date(d-9*3600e3).toISOString();
 const od=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:100,query:{filter:{date_time_filter:{created_at:{start_at:start}},state_filter:{states:['OPEN','COMPLETED']}},sort:{sort_field:'CREATED_AT',sort_order:'DESC'}}})});
 for(const o of (od.orders||[]))await kdsUpsert(o);console.log('kds seeded',kds.size);
}catch(e){console.error('kds seed',e.message)}}
function kdsList(){const d=new Date(Date.now()+9*3600e3);d.setUTCHours(0,0,0,0);const start=d-9*3600e3;
 return [...kds.values()].map(({raw,...x})=>({...x,unpaid:isUnpaidWeb(raw)})).filter(x=>Date.parse(x.created_at)>=start&&(x.state==='OPEN'||Date.now()-Date.parse(x.updated_at)<3*3600e3)).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at))}
function jres(r,c,o){r.writeHead(c,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});r.end(JSON.stringify(o))}
function isUnpaidWeb(o){if(!o||o.reference_id!=='mstand-web'||o.state!=='OPEN')return false;if((o.tenders||[]).length)return false;
 const p=st.preparing.find(y=>y.order===o.id||y.paidOrder===o.id);if(p&&(!p.unpaid||p.paidOrder))return false;return true}
async function kdsSetState(id,to){
 const g=await sq('/orders/'+encodeURIComponent(id));const o=g.order;const f=pickupF(o);
 if(!f)throw Object.assign(new Error('no fulfillment'),{code:409});
 if(o.state!=='OPEN')throw Object.assign(new Error('order '+o.state),{code:409});
 const u=await sq('/orders/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({idempotency_key:require('crypto').randomUUID(),order:{location_id:LOC,version:o.version,fulfillments:[{uid:f.uid,state:to}]}})});
 return u.order;
}
function kdsApi(u,q,r){
 const key=q.headers['x-kds-key']||u.searchParams.get('key')||'';
 if(!KDS_KEY||key!==KDS_KEY)return jres(r,403,{error:'key'});
 if(u.pathname==='/api/kds'&&q.method==='GET')return jres(r,200,{orders:kdsList(),now:Date.now()});
 if(q.method!=='POST'||!/^\/api\/kds\/(done|recall|cancel)$/.test(u.pathname))return jres(r,404,{});
 let b='';q.on('data',c=>{b+=c;if(b.length>2000)q.destroy()});q.on('end',async()=>{
  let j={};try{j=JSON.parse(b)}catch(e){}
  const x=kds.get(String(j.id||''));if(!x)return jres(r,404,{error:'unknown order'});
  if(x.readonly)return jres(r,403,{error:'Uber 订单不能在 KDS 改状态'});
  if(u.pathname.endsWith('/cancel')){
   if(!isUnpaidWeb(x.raw))return jres(r,409,{error:'只能取消未付款的手机单'});
   let warn='';
   try{const g=(await sq('/orders/'+encodeURIComponent(x.id))).order;
    if((g.tenders||[]).length||g.state!=='OPEN')return jres(r,409,{error:'这张单已付款或已结束，不能取消'});
    await sq('/orders/'+encodeURIComponent(x.id),{method:'PUT',body:JSON.stringify({idempotency_key:crypto.randomUUID(),order:{location_id:LOC,version:g.version,state:'CANCELED'}})})}
   catch(e){console.error('kds cancel square failed',e.message);warn='Square 没取消成功，只从 KDS 和叫号屏移除'}
   kds.delete(x.id);delete kdsLoc()[x.id];
   st.preparing=st.preparing.filter(y=>y.order!==x.id&&y.paidOrder!==x.id);st.seq++;save();push('prep');
   return jres(r,200,{ok:true,warn,cancelled:x.id});
  }
  if(u.pathname.endsWith('/recall')&&x.state!=='PREPARED')return jres(r,409,{error:'只能召回刚完成的单'});
  if(u.pathname.endsWith('/done')&&x.state!=='OPEN')return jres(r,409,{error:'这张单已经完成了'});
  try{
   let warn='';
   if(u.pathname.endsWith('/done')){
    try{const o=await kdsSetState(x.id,'PREPARED');delete kdsLoc()[x.id];await kdsUpsert(o)}
    catch(e){console.error('kds done square update failed',e.message);warn='Square 状态没改到（收银机建的单 API 不能改），只在 KDS 和叫号屏上标完成';kdsLoc()[x.id]='done';await kdsUpsert(x.raw)}
    st.calledOrders=st.calledOrders||[];if(!st.calledOrders.includes(x.id))st.calledOrders.push(x.id);st.calledOrders=st.calledOrders.slice(-500);
    st.preparing=st.preparing.filter(y=>y.order!==x.id&&y.paidOrder!==x.id);
    callNum(/^[0-9]+$/.test(String(x.name))?parseInt(x.name):x.name,itemsOf(x.raw),x.raw);
   }else{
    // Square cannot move PREPARED back to RESERVED, so recall is a KDS/screen-side reopen
    kdsLoc()[x.id]='open';await kdsUpsert(x.raw);
    const lab=/^[0-9]+$/.test(String(x.name))?parseInt(x.name):x.name;
    st.history=st.history.filter(h=>String(h)!==String(lab));
    if(String(st.current)===String(lab))st.current=st.history[0]||0;
    st.seq++;st.at=Date.now();save();push('prep');
   }
   jres(r,200,{ok:true,warn,order:(({raw,...y})=>y)(kds.get(x.id))});
  }catch(e){console.error('kds',u.pathname,e.message);jres(r,e.code||502,{error:e.message})}
 });
}

// --- Fun features: today's top 3, cup milestones, birthday / regular greeting, weather (all fail-safe) ---
const FUN_REWARD=String(process.env.FUN_REWARD_TEXT||'').slice(0,60); // e.g. "次回トッピング無料" — empty by default
const LIFE_BASE=parseInt(process.env.LIFETIME_CUPS_BASE||''); // lifetime cups sold before this counter existed; unset = lifetime milestones off
const tokyoDay=(t)=>new Date((t||Date.now())+9*3600e3).toISOString().slice(0,10);
const cupsOf=o=>((o&&o.line_items)||[]).reduce((a,l)=>a+(/ギフト|gift|袋|bag/i.test(l.name||'')?0:(parseInt(l.quantity)||0)),0);
let stats={day:'',top3:[],cum:{},total:0,at:0};
async function statsRefresh(){
 if(!TOK)return;
 try{
  const day=tokyoDay();const start=new Date(Date.parse(day+'T00:00:00+09:00')).toISOString();
  let orders=[],cur,pages=0;
  do{const d=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:500,cursor:cur,query:{filter:{date_time_filter:{created_at:{start_at:start}},state_filter:{states:['OPEN','COMPLETED']}},sort:{sort_field:'CREATED_AT',sort_order:'ASC'}}})});
   orders=orders.concat(d.orders||[]);cur=d.cursor;pages++}while(cur&&pages<6);
  orders=orders.filter(o=>!/giftcard/i.test((o.source&&o.source.name)||'')&&cupsOf(o)>0).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at));
  const cnt={},cum={};let tot=0;
  for(const o of orders){const c=cupsOf(o);cum[o.id]=[tot+1,tot+c];tot+=c;
   for(const l of (o.line_items||[])){const q=parseInt(l.quantity)||0;if(!q||/ギフト|gift|袋|bag/i.test(l.name||''))continue;const k=String(l.name||'').trim();cnt[k]=(cnt[k]||0)+q}}
  const top3=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,q])=>{const d=VT.drink(n)||{};return {ja:d.ja||n,zh:d.zh||n,en:d.en||'',q}});
  stats={day,top3,cum,total:tot,at:Date.now()};
 }catch(e){console.error('fun stats',e.message)}
}
if(TOK){setTimeout(statsRefresh,20000);setInterval(statsRefresh,3*60e3)}
// milestone: the called order's cup range [a,b] contains a multiple of 100 (today), or of 1000 (lifetime, if base set)
function cupFx(o,items){
 const fx={};const c=o?cupsOf(o):(items||[]).reduce((a,b)=>a+(b.q||0),0);if(!c)return fx;
 st.fun=st.fun||{};const day=tokyoDay();
 if(st.fun.day!==day){st.fun.day=day;st.fun.counted=[];st.fun.extra=0}
 const id=o&&o.id;if(id&&st.fun.counted.includes(id))return fx;if(id){st.fun.counted.push(id);st.fun.counted=st.fun.counted.slice(-800)}
 let r=id&&stats.day===day&&stats.cum[id];
 if(!r){const base=(stats.day===day?stats.total:0)+st.fun.extra;r=[base+1,base+c];st.fun.extra+=c}
 const m=Math.floor(r[1]/100)*100;if(m>=100&&m>=r[0])fx.ms=m;
 if(!isNaN(LIFE_BASE)){const a=(st.fun.life||LIFE_BASE)+1,b=a+c-1;st.fun.life=b;const L=Math.floor(b/1000)*1000;if(L>=1000&&L>=a)fx.life=L}
 return fx;
}
const custC=new Map(); // id -> {day,bday,visits}; personal data stays in memory, never logged
async function custFx(o){
 const id=o.customer_id,day=tokyoDay();let c=custC.get(id);
 if(!c||c.day!==day){
  c={day,bday:false,visits:0};
  try{const cu=(await sq('/customers/'+encodeURIComponent(id))).customer||{};const b=String(cu.birthday||'');c.bday=b.length>=10&&b.slice(5,10)===day.slice(5,10)}catch(e){}
  try{let n=0,cur,p=0;do{const d=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:500,cursor:cur,return_entries:true,query:{filter:{customer_filter:{customer_ids:[id]},state_filter:{states:['OPEN','COMPLETED']}}}})});n+=(d.order_entries||[]).length;cur=d.cursor;p++}while(cur&&p<4);c.visits=n}catch(e){}
  custC.set(id,c);if(custC.size>300)custC.delete(custC.keys().next().value);
 }
 const fx={};if(c.bday)fx.bday=1;if(c.visits>=10&&c.visits%10===0)fx.reg=c.visits;return fx;
}
// Ikebukuro weather via Open-Meteo (free, no key), cached 20 min
let wx={at:0,data:null};
async function weather(){
 if(Date.now()-wx.at<20*60e3)return;wx.at=Date.now();
 try{const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),5000);
  const x=await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.7295&longitude=139.7109&current=temperature_2m,weather_code&timezone=Asia%2FTokyo',{signal:ctl.signal});clearTimeout(to);
  if(!x.ok)throw new Error('wx '+x.status);const j=await x.json();const t=j.current&&j.current.temperature_2m;if(typeof t!=='number')throw new Error('wx data');
  wx.data={t:Math.round(t),code:j.current.weather_code,rec:t>=25?'ice':t<=15?'hot':'mild'};
 }catch(e){console.error('weather',e.message)}
}
weather();setInterval(weather,20*60e3);
function funState(){return {top3:stats.day===tokyoDay()?stats.top3:[],weather:wx.data,reward:FUN_REWARD,day:tokyoDay()}}

const IPAD=require('./ipad')({sq,LOC,st:()=>st,save,push,PIN,menu,invalidateMenu:()=>{menuC.at=0;menu().catch(()=>{})},TOK});
