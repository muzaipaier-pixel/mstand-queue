// Box-side: follow iPad 店铺状态 -> Uber Eats store pause/resume. DEFAULT DRY RUN (logs only). Live needs --live AND the toggle implemented below.
// env: MSTAND_URL (default https://mstand-queue.onrender.com), MSTAND_PIN (staff PIN; read from env, never logged)
const fs=require('fs');const URL0=process.env.MSTAND_URL||'https://mstand-queue.onrender.com';const PIN=process.env.MSTAND_PIN||'';
const LIVE=process.argv.includes('--live');const LOG=__dirname+'/pause.log';
const log=m=>{const l=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Tokyo'})+' JST '+m;fs.appendFileSync(LOG,l+'\n');console.log(l)};
const api=(p,b)=>fetch(URL0+'/api/ipad/'+p,{method:b?'POST':'GET',headers:{'content-type':'application/json','x-pin':PIN},body:b&&JSON.stringify(b)}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()});
async function setUberPaused(paused){
 if(!LIVE)return 'DRY: would '+(paused?'PAUSE store (Uber Eats Manager > Store status > Pause new orders, until manually resumed)':'RESUME store (Uber Eats Manager > Store status > Accept orders)');
 throw new Error('live toggle not implemented yet (needs go-ahead + UI selector probe on port 9226)');}
let done=-1;
async function tick(){try{const d=await api('uber-desired');if(d.seq===done)return;
 let ok=true,msg='';try{msg=await setUberPaused(d.paused)}catch(e){ok=false;msg=e.message}
 log(`seq ${d.seq} mode=${d.mode} -> ${msg}`);await api('uber-ack',{seq:d.seq,paused:d.paused,ok,dry:!LIVE,msg:ok?'':msg});if(ok)done=d.seq}catch(e){log('ERR '+e.message)}}
tick();setInterval(tick,15000);
