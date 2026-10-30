// Website live chat (kkmurado.com). Store: DATA_DIR/sitechat.json.
// Public (CORS for kkmurado.com): POST /api/sitechat/send {cid?,token?,name?,text} -> {cid,token}
//   GET /api/sitechat/poll?cid&token&since -> {msgs}
// Owner (x-pin): GET /api/sitechat/admin/list, GET /api/sitechat/admin/thread?cid, POST /api/sitechat/admin/reply {cid,text}
const TR=require('./translate');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function({PIN}){
const F=path.join(process.env.DATA_DIR||path.join(__dirname,'..'),'sitechat.json');
let D={c:{}};try{D=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
let t=null;const save=()=>{if(t)return;t=setTimeout(()=>{t=null;try{fs.writeFileSync(F+'.tmp',JSON.stringify(D));fs.renameSync(F+'.tmp',F)}catch(e){console.error('sitechat save',e.message)}},500)};
const ORIG=(process.env.CHAT_ORIGINS||'https://kkmurado.com,https://www.kkmurado.com').split(',').map(s=>s.trim());
const MAXLEN=500,MAXNAME=40,MAXCONV=2000,MAXMSG=200;
const RL=new Map(); // ip -> [timestamps]
const limited=(ip,n,ms)=>{const now=Date.now(),a=(RL.get(ip)||[]).filter(x=>now-x<ms);a.push(now);RL.set(ip,a);return a.length>n};
setInterval(()=>{const now=Date.now();for(const[k,a]of RL)if(!a.some(x=>now-x<3600e3))RL.delete(k)},600e3).unref();
const authOk=p=>PIN&&p&&p.length===PIN.length&&crypto.timingSafeEqual(Buffer.from(p),Buffer.from(PIN));
const send=(r,c,o,h)=>{r.writeHead(c,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...h});r.end(JSON.stringify(o))};
const body=q=>new Promise(res=>{let b='';q.on('data',c=>{b+=c;if(b.length>4000)q.destroy()});q.on('end',()=>{try{res(JSON.parse(b||'{}'))}catch(e){res({})}})});
const clean=(s,n)=>String(s||'').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').trim().slice(0,n);
const prune=()=>{const ks=Object.keys(D.c);if(ks.length<=MAXCONV)return;ks.sort((a,b)=>D.c[a].last-D.c[b].last).slice(0,ks.length-MAXCONV).forEach(k=>delete D.c[k])};
return async function(u,q,r){
 const o=q.headers.origin||'',ok=ORIG.includes(o)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)&&process.env.CHAT_DEV==='1';
 const H=ok?{'Access-Control-Allow-Origin':o,'Vary':'Origin','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{};
 if(q.method==='OPTIONS'){r.writeHead(204,H);return r.end()}
 const ip=String(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim();
 const p=u.pathname.replace('/api/sitechat','');
 if(p.startsWith('/admin')){
  if(!authOk(String(q.headers['x-pin']||'')))return send(r,403,{error:'pin'});
  if(p==='/admin/list'){const L=Object.entries(D.c).map(([cid,c])=>({cid,name:c.name,last:c.last,unread:c.unread||0,preview:(c.m[c.m.length-1]||{}).zh||(c.m[c.m.length-1]||{}).t||'',lang:c.lang,from:(c.m[c.m.length-1]||{}).f})).sort((a,b)=>b.last-a.last);return send(r,200,{list:L,unread:L.reduce((s,x)=>s+x.unread,0)})}
  if(p==='/admin/thread'){const c=D.c[u.searchParams.get('cid')];if(!c)return send(r,404,{});c.unread=0;save();return send(r,200,{name:c.name,lang:c.lang,msgs:c.m})}
  if(p==='/admin/reply'&&q.method==='POST'){const j=await body(q);const c=D.c[j.cid];const tx=clean(j.text,MAXLEN*2);if(!c||!tx)return send(r,400,{});const m={f:'s',t:tx,at:Date.now()},L=c.lang||'ja';if(L!=='zh'){const x=await TR.tr(tx,L,'zh').catch(()=>null);if(x)m.tr=x.text,m.to=L}c.m.push(m);c.last=Date.now();c.unread=0;save();return send(r,200,{ok:1,m})}
  if(p==='/admin/delete'&&q.method==='POST'){const j=await body(q);if(!D.c[j.cid])return send(r,404,{});delete D.c[j.cid];save();return send(r,200,{ok:1})}
  return send(r,404,{});
 }
 if(p==='/send'&&q.method==='POST'){
  if(limited(ip,8,60e3)||limited('h'+ip,40,3600e3))return send(r,429,{error:'しばらくしてからお試しください'},H);
  const j=await body(q);if(j.hp)return send(r,200,{ok:1},H); // honeypot
  const tx=clean(j.text,MAXLEN);if(!tx)return send(r,400,{error:'empty'},H);
  let c=j.cid&&D.c[j.cid];if(c&&c.tok!==j.token)c=null;
  let cid=j.cid,tok=j.token;
  if(!c){if(limited('n'+ip,5,3600e3))return send(r,429,{error:'limit'},H);cid=crypto.randomBytes(8).toString('hex');tok=crypto.randomBytes(16).toString('hex');c=D.c[cid]={tok,name:'',m:[],last:0,unread:0,ip};prune()}
  const nm=clean(j.name,MAXNAME);if(nm)c.name=nm;
  const hl=TR.norm(String(j.lang||''));const m={f:'c',t:tx,at:Date.now()};
  const z=await TR.tr(tx,'zh').catch(()=>null);m.lang=z?z.from:TR.det(tx);if(z&&m.lang!=='zh')m.zh=z.text;
  c.lang=['zh','ja','en'].includes(m.lang)?m.lang:(hl||c.lang||'ja');c.m.push(m);if(c.m.length>MAXMSG)c.m=c.m.slice(-MAXMSG);c.last=Date.now();c.unread=(c.unread||0)+1;save();
  if(global.SITECHAT_PUSH)try{global.SITECHAT_PUSH()}catch(e){}
  return send(r,200,{cid,token:tok},H)}
 if(p==='/poll'){const c=D.c[u.searchParams.get('cid')];if(!c||c.tok!==u.searchParams.get('token'))return send(r,404,{},H);
  const s=+u.searchParams.get('since')||0;return send(r,200,{msgs:c.m.filter(x=>x.at>s).map(({f,t,at,tr})=>tr?{f,t:tr,orig:t,at}:{f,t,at})},H)}
 send(r,404,{},H)}};
