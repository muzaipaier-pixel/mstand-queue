const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||8787, PIN=String(process.env.PIN||(()=>{try{return fs.readFileSync(__dirname+'/pin.txt','utf8')}catch(e){return ''}})()).trim();
if(!PIN)console.warn('WARNING: no PIN set');
const SF=__dirname+'/state.json';
let st={current:0,history:[],seq:0};
try{st=JSON.parse(fs.readFileSync(SF))}catch(e){}
st.preparing=st.preparing||[];st.seenPay=st.seenPay||[];
const save=()=>fs.writeFileSync(SF,JSON.stringify(st));
const clients=new Set();
const pub=()=>{const{seenPay,sqSince,rdySince,calledOrders,...o}=st;return o};
const push=(ev)=>{const d=`data: ${JSON.stringify({...pub(),event:ev})}\n\n`;clients.forEach(c=>c.write(d));};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.wav':'audio/wav','.mp3':'audio/mpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{
 const u=new URL(q.url,'http://x');
 if(u.pathname.length>1&&u.pathname.endsWith('/'))u.pathname=u.pathname.replace(/\/+$/,'')||'/'; // /order/ -> /order
 if(u.pathname==='/events'){r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});r.write(`data: ${JSON.stringify({...pub(),event:'init'})}\n\n`);clients.add(r);const k=setInterval(()=>r.write(':k\n\n'),20000);q.on('close',()=>{clients.delete(r);clearInterval(k)});return;}
if(u.pathname==='/voice'){voice(u.searchParams.get('n')||'',r);return;}
 if(u.pathname==='/api/menu'){menu().then(m=>{r.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});r.end(JSON.stringify(m))}).catch(e=>{console.error('menu',e.message);r.writeHead(502);r.end('{"error":"menu"}')});return;}
 if(u.pathname==='/api/checkout'&&q.method==='POST'){let b='';q.on('data',c=>{b+=c;if(b.length>2e4)q.destroy()});q.on('end',()=>checkout(b,q,r));return;}
 if(u.pathname==='/api/order-status'){orderStatus(u.searchParams.get('id')||'',r);return;}
 if(u.pathname==='/api/state')return r.end(JSON.stringify(pub()));
 if(u.pathname==='/api/action'&&q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{let j={};try{j=JSON.parse(b)}catch(e){}
  if(String(j.pin)!==PIN){r.writeHead(403);return r.end('{"error":"PIN"}')}
  if(j.action==='check')return r.end('{"ok":true}');
  let ev='call';
  if(j.action==='next')st.current=st.current+1;
  else if(j.action==='set'){const n=parseInt(j.number);if(!(n>0&&n<10000)){r.writeHead(400);return r.end('{}')}st.current=n}
  else if(j.action==='recall'){if(!st.current){return r.end('{}')}ev='recall'}
  else if(j.action==='reset'){st={current:0,history:[],seq:st.seq,preparing:[],seenPay:st.seenPay,sqSince:st.sqSince};ev='reset'}
  else if(j.action==='callid'){const x=st.preparing.find(y=>y.id===j.id);if(!x)return r.end('{}');callNum(/^[0-9]+$/.test(String(x.num))?parseInt(x.num):x.num);return r.end(JSON.stringify({ok:true,...pub()}))}
  else if(j.action==='paid'){const x=st.preparing.find(y=>y.id===j.id);if(x)x.unpaid=false;ev='prep'}
  else if(j.action==='done'){st.preparing=st.preparing.filter(x=>x.id!==j.id);ev='prep'}
  else {r.writeHead(400);return r.end('{}')}
  if(ev==='call'){st.preparing=st.preparing.filter(x=>String(x.num)!==String(st.current));st.history=[st.current,...st.history.filter(x=>x!==st.current)].slice(0,8)}
  st.seq++;st.at=Date.now();if(ev==='call'||ev==='recall')st.callAt=st.at;save();push(ev);r.end(JSON.stringify({ok:true,...pub()}));});return;}
 let p=u.pathname==='/'?'/display.html':u.pathname==='/staff'?'/staff.html':u.pathname==='/display'?'/display.html':u.pathname==='/screen'?'/screen.html':u.pathname==='/screen-test'?'/screen-test.html':u.pathname==='/order'?'/order.html':u.pathname==='/order/done'?'/order-done.html':u.pathname;
 const f=path.join(__dirname,'public',path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('404')}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':path.extname(f)==='.html'?'no-cache':'public, max-age=3600'});r.end(d)});
}).listen(PORT,'0.0.0.0',()=>console.log('listening',PORT));

// --- Square: auto-add in-store paid orders to "preparing" ---
const TOK=process.env.SQUARE_ACCESS_TOKEN, LOC=process.env.SQUARE_LOCATION_ID||'LM4FNJNN3XFAH';
async function sq(pth,opt={}){const r=await fetch('https://connect.squareup.com/v2'+pth,{...opt,headers:{'Authorization':'Bearer '+TOK,'Square-Version':'2025-01-23','Content-Type':'application/json'}});if(!r.ok)throw new Error('square '+r.status);return r.json()}
async function poll(){
 try{
  if(!st.sqSince){st.sqSince=new Date().toISOString();save();return}
  await checkReady();
  const since=new Date(Date.parse(st.sqSince)-120000).toISOString();
  const d=await sq(`/payments?location_id=${LOC}&begin_time=${encodeURIComponent(since)}&sort_order=ASC&limit=100`);
  const pays=(d.payments||[]).filter(p=>p.status==='COMPLETED'&&!st.seenPay.includes(p.id));
  st.sqSince=new Date().toISOString();
  if(!pays.length){save();return}
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
  save();if(added){st.seq++;push('prep')}
 }catch(e){console.error('square poll',e.message)}
}
if(TOK){poll();setInterval(poll,12000);console.log('square polling on')}

// auto-call when Square marks a tracked order ready/completed
function callNum(num){st.current=num;st.preparing=st.preparing.filter(x=>String(x.num)!==String(num));st.history=[num,...st.history.filter(x=>String(x)!==String(num))].slice(0,8);st.seq++;st.at=Date.now();st.callAt=st.at;save();push('call')}
async function labelOf(o){
 const rec=((o.fulfillments||[]).map(f=>((f.delivery_details||f.pickup_details||{}).recipient||{}).display_name).find(Boolean)||'').trim();
 let label=(o.ticket_name||'').trim()||rec||o.id.slice(-4);
 if(/^[0-9]+$/.test(label)&&o.customer_id){const fam=await familyName(o.customer_id);if(fam)label=fam}
 return label.replace(/[<>&"'`\\]/g,'').slice(0,24);
}
// Auto-call: search ALL orders updated recently (not only tracked ones), so it works after
// a server restart and regardless of which device (phone / Register) marked it done.
async function checkReady(){
 st.calledOrders=st.calledOrders||[];
 const now=new Date().toISOString();
 if(!st.rdySince){st.rdySince=now;save();return}
 const since=new Date(Date.parse(st.rdySince)-120000).toISOString();
 const body={location_ids:[LOC],limit:100,query:{filter:{date_time_filter:{updated_at:{start_at:since}},state_filter:{states:['OPEN','COMPLETED']}},sort:{sort_field:'UPDATED_AT',sort_order:'ASC'}}};
 const od=await sq('/orders/search',{method:'POST',body:JSON.stringify(body)});
 st.rdySince=now;
 for(const o of (od.orders||[])){
  if(st.calledOrders.includes(o.id))continue;
  const src=((o.source&&o.source.name)||'');if(/uber|giftcard/i.test(src))continue;
  const fdone=(o.fulfillments||[]).some(f=>f.state==='PREPARED'||f.state==='COMPLETED');
  // mobile orders: only the pickup fulfillment going PREPARED/COMPLETED counts (payment alone must not trigger a call)
  const done=o.reference_id==='mstand-web'?fdone:(o.state==='COMPLETED'||fdone);
  if(!done)continue;
  if(Date.now()-Date.parse(o.created_at)>3*3600e3)continue; // ignore old tickets being cleaned up
  if(Date.parse(o.updated_at)-Date.parse(o.created_at)<45000)continue; // auto-closed at checkout, not a real "ready"
  st.calledOrders.push(o.id);st.calledOrders=st.calledOrders.slice(-500);
  const x=st.preparing.find(y=>y.order===o.id||y.paidOrder===o.id);
  const lab=x?x.num:await labelOf(o);
  st.preparing=st.preparing.filter(y=>y.order!==o.id&&y.paidOrder!==o.id);
  console.log('auto-call order');callNum(/^[0-9]+$/.test(String(lab))?parseInt(lab):lab);
  await new Promise(r=>setTimeout(r,8000));
 }
 save();
}

// --- voice clips via Google Translate TTS, cached; fallback to generic clip ---
const vcache=new Map();
function phrase(n){n=String(n).replace(/[<>&"'`\\]/g,'').trim().slice(0,24);return /^[0-9]+$/.test(n)?n+'番のお客様、お待たせしました':n+'様、お待たせしました'}
async function voice(n,r){
 const send=(b)=>{r.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':b.length,'Cache-Control':'public, max-age=86400'});r.end(b)};
 const fb=()=>fs.readFile(path.join(__dirname,'public','voice_fallback.mp3'),(e,d)=>{if(e){r.writeHead(404);return r.end()}send(d)});
 if(!n)return fb();
 const t=phrase(n);
 if(vcache.has(t))return send(vcache.get(t));
 try{
  const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),6000);
  const x=await fetch('https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q='+encodeURIComponent(t),{headers:{'User-Agent':'Mozilla/5.0'},signal:ctl.signal});
  clearTimeout(to);
  if(!x.ok)throw new Error('tts '+x.status);
  const b=Buffer.from(await x.arrayBuffer());if(b.length<1000)throw new Error('tts short');
  vcache.set(t,b);if(vcache.size>300)vcache.delete(vcache.keys().next().value);
  send(b);
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
let menuC={at:0,data:null};
async function menu(){
 if(menuC.data&&Date.now()-menuC.at<5*60e3)return menuC.data;
 let objs=[],cur;do{const d=await sq('/catalog/list?types=ITEM,CATEGORY,IMAGE'+(cur?'&cursor='+encodeURIComponent(cur):''));objs=objs.concat(d.objects||[]);cur=d.cursor}while(cur);
 const img={},cat={};objs.forEach(o=>{if(o.type==='IMAGE')img[o.id]=o.image_data.url;if(o.type==='CATEGORY')cat[o.id]=o.category_data.name});
 const at=o=>(o.present_at_all_locations||(o.present_at_location_ids||[]).includes(LOC))&&!(o.absent_at_location_ids||[]).includes(LOC);
 const items=[];
 for(const o of objs){if(o.type!=='ITEM'||o.is_deleted||!at(o))continue;const d=o.item_data;
  if(d.product_type==='GIFT_CARD'||/ギフト|gift/i.test(d.name))continue;
  const vars=(d.variations||[]).filter(v=>at(v)&&v.item_variation_data.price_money).map(v=>({id:v.id,name:v.item_variation_data.name||'',price:Number(v.item_variation_data.price_money.amount)}));
  if(!vars.length)continue;
  const c=(d.categories||[]).map(x=>cat[x.id]).find(Boolean)||cat[d.category_id]||'その他';
  items.push({id:o.id,name:d.name,cat:c,desc:(d.description_plaintext||'').split('\n')[0].slice(0,40),img:img[(d.image_ids||[])[0]]||'',vars});}
 menuC={at:Date.now(),data:items};return items;
}
const cleanName=s=>String(s||'').replace(/[<>&"'`\\\u0000-\u001f]/g,'').trim().slice(0,12);
const rl=new Map(); // ip -> [timestamps]
function limited(ip){const now=Date.now(),a=(rl.get(ip)||[]).filter(t=>now-t<10*60e3);if(a.length>=3){rl.set(ip,a);return true}a.push(now);rl.set(ip,a);if(rl.size>5000)rl.delete(rl.keys().next().value);return false}
async function checkout(b,q,r){
 const bad=(c,m)=>{r.writeHead(c,{'Content-Type':'application/json'});r.end(JSON.stringify({error:m}))};
 try{
  let j;try{j=JSON.parse(b)}catch(e){return bad(400,'json')}
  const name=cleanName(j.name);if(!name)return bad(400,'name');
  const m=await menu();const vm={};m.forEach(i=>i.vars.forEach(v=>vm[v.id]=v));
  const lines=(Array.isArray(j.items)?j.items:[]).filter(x=>vm[x.v]).map(x=>({catalog_object_id:x.v,quantity:String(Math.min(20,Math.max(1,parseInt(x.q)||1)))})).slice(0,30);
  if(!lines.length)return bad(400,'items');
  const ip=String(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim();
  if(limited(ip))return bad(429,'rate');
  const body={idempotency_key:require('crypto').randomUUID(),
   order:{location_id:LOC,state:'OPEN',source:{name:'M Stand スマホ注文'},ticket_name:name,reference_id:'mstand-web',line_items:lines,
    fulfillments:[{type:'PICKUP',state:'PROPOSED',pickup_details:{recipient:{display_name:name},schedule_type:'ASAP',prep_time_duration:'PT10M',note:'スマホ注文（レジで支払い）'}}]}};
  const o=(await sq('/orders',{method:'POST',body:JSON.stringify(body)})).order||{};
  const no=shortNo(o.id);
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
