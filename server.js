const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||8787, PIN=String(process.env.PIN||(()=>{try{return fs.readFileSync(__dirname+'/pin.txt','utf8')}catch(e){return ''}})()).trim();
if(!PIN)console.warn('WARNING: no PIN set');
const SF=__dirname+'/state.json';
let st={current:0,history:[],seq:0};
try{st=JSON.parse(fs.readFileSync(SF))}catch(e){}
const save=()=>fs.writeFileSync(SF,JSON.stringify(st));
const clients=new Set();
const push=(ev)=>{const d=`data: ${JSON.stringify({...st,event:ev})}\n\n`;clients.forEach(c=>c.write(d));};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{
 const u=new URL(q.url,'http://x');
 if(u.pathname==='/events'){r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});r.write(`data: ${JSON.stringify({...st,event:'init'})}\n\n`);clients.add(r);const k=setInterval(()=>r.write(':k\n\n'),20000);q.on('close',()=>{clients.delete(r);clearInterval(k)});return;}
 if(u.pathname==='/api/state')return r.end(JSON.stringify(st));
 if(u.pathname==='/api/action'&&q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{let j={};try{j=JSON.parse(b)}catch(e){}
  if(String(j.pin)!==PIN){r.writeHead(403);return r.end('{"error":"PIN"}')}
  if(j.action==='check')return r.end('{"ok":true}');
  let ev='call';
  if(j.action==='next')st.current=st.current+1;
  else if(j.action==='set'){const n=parseInt(j.number);if(!(n>0&&n<10000)){r.writeHead(400);return r.end('{}')}st.current=n}
  else if(j.action==='recall'){if(!st.current){return r.end('{}')}ev='recall'}
  else if(j.action==='reset'){st={current:0,history:[],seq:st.seq};ev='reset'}
  else {r.writeHead(400);return r.end('{}')}
  if(ev==='call'){st.history=[st.current,...st.history.filter(x=>x!==st.current)].slice(0,8)}
  st.seq++;st.at=Date.now();save();push(ev);r.end(JSON.stringify({ok:true,...st}));});return;}
 let p=u.pathname==='/'?'/display.html':u.pathname==='/staff'?'/staff.html':u.pathname==='/display'?'/display.html':u.pathname==='/screen'?'/screen.html':u.pathname;
 const f=path.join(__dirname,'public',path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('404')}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});r.end(d)});
}).listen(PORT,'0.0.0.0',()=>console.log('listening',PORT));
