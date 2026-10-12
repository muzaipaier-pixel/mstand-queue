const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||8787, PIN=String(process.env.PIN||(()=>{try{return fs.readFileSync(__dirname+'/pin.txt','utf8')}catch(e){return ''}})()).trim();
if(!PIN)console.warn('WARNING: no PIN set');
const SF=__dirname+'/state.json';
let st={current:0,history:[],seq:0};
try{st=JSON.parse(fs.readFileSync(SF))}catch(e){}
st.preparing=st.preparing||[];st.seenPay=st.seenPay||[];
const save=()=>fs.writeFileSync(SF,JSON.stringify(st));
const clients=new Set();
const pub=()=>{const{seenPay,sqSince,...o}=st;return o};
const push=(ev)=>{const d=`data: ${JSON.stringify({...pub(),event:ev})}\n\n`;clients.forEach(c=>c.write(d));};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{
 const u=new URL(q.url,'http://x');
 if(u.pathname==='/events'){r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});r.write(`data: ${JSON.stringify({...pub(),event:'init'})}\n\n`);clients.add(r);const k=setInterval(()=>r.write(':k\n\n'),20000);q.on('close',()=>{clients.delete(r);clearInterval(k)});return;}
 if(u.pathname==='/api/state')return r.end(JSON.stringify(pub()));
 if(u.pathname==='/api/action'&&q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{let j={};try{j=JSON.parse(b)}catch(e){}
  if(String(j.pin)!==PIN){r.writeHead(403);return r.end('{"error":"PIN"}')}
  if(j.action==='check')return r.end('{"ok":true}');
  let ev='call';
  if(j.action==='next')st.current=st.current+1;
  else if(j.action==='set'){const n=parseInt(j.number);if(!(n>0&&n<10000)){r.writeHead(400);return r.end('{}')}st.current=n}
  else if(j.action==='recall'){if(!st.current){return r.end('{}')}ev='recall'}
  else if(j.action==='reset'){st={current:0,history:[],seq:st.seq,preparing:[],seenPay:st.seenPay,sqSince:st.sqSince};ev='reset'}
  else if(j.action==='done'){st.preparing=st.preparing.filter(x=>x.id!==j.id);ev='prep'}
  else {r.writeHead(400);return r.end('{}')}
  if(ev==='call'){st.preparing=st.preparing.filter(x=>String(x.num)!==String(st.current));st.history=[st.current,...st.history.filter(x=>x!==st.current)].slice(0,8)}
  st.seq++;st.at=Date.now();save();push(ev);r.end(JSON.stringify({ok:true,...pub()}));});return;}
 let p=u.pathname==='/'?'/display.html':u.pathname==='/staff'?'/staff.html':u.pathname==='/display'?'/display.html':u.pathname==='/screen'?'/screen.html':u.pathname;
 const f=path.join(__dirname,'public',path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('404')}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':path.extname(f)==='.html'?'no-cache':'public, max-age=3600'});r.end(d)});
}).listen(PORT,'0.0.0.0',()=>console.log('listening',PORT));

// --- Square: auto-add in-store paid orders to "preparing" ---
const TOK=process.env.SQUARE_ACCESS_TOKEN, LOC=process.env.SQUARE_LOCATION_ID||'LM4FNJNN3XFAH';
async function sq(pth,opt={}){const r=await fetch('https://connect.squareup.com/v2'+pth,{...opt,headers:{'Authorization':'Bearer '+TOK,'Square-Version':'2025-01-23','Content-Type':'application/json'}});if(!r.ok)throw new Error('square '+r.status);return r.json()}
async function poll(){
 try{
  if(!st.sqSince){st.sqSince=new Date().toISOString();save();return}
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
   const deliv=(o.fulfillments||[]).some(f=>f.type==='DELIVERY'||f.type==='SHIPMENT');
   if(deliv||/uber|deliver/i.test(src))continue; // exclude Uber/delivery
   if(st.preparing.some(x=>x.order===o.id))continue;
   const num=/^\d+$/.test((o.ticket_name||'').trim())?o.ticket_name.trim():(o.ticket_name||'').trim()||o.id.slice(-4);
   st.preparing.push({id:p.id,order:o.id,num,items:(o.line_items||[]).map(l=>l.name+(l.quantity!=='1'?'×'+l.quantity:'')).join('、'),at:Date.now()});added++;
  }
  st.seenPay=st.seenPay.slice(-1000);
  st.preparing=st.preparing.filter(x=>Date.now()-x.at<3*3600e3);
  save();if(added){st.seq++;push('prep')}
 }catch(e){console.error('square poll',e.message)}
}
if(TOK){poll();setInterval(poll,12000);console.log('square polling on')}
