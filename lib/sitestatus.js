// Public read-only live store status for the website. No sales/order data, only coarse state.
const NAMES=require('./names');
const HOURS={open:17,close:2}; // JST, closes next day 02:00
module.exports=function({st,waitEst,menu}){
 let soC={at:0,v:[]};
 async function soldOut(){if(Date.now()-soC.at<60e3)return soC.v;try{const items=await menu();
   soC.v=items.filter(i=>i.vars&&i.vars.length&&i.vars.every(v=>v.so)).map(i=>{const t=NAMES[i.name]||[i.name,i.name];return{ja:i.name,zh:t[0],en:t[1],img:i.img||''}});soC.at=Date.now()}catch(e){}return soC.v}
 async function status(){
  const now=new Date(),h=new Date(now.getTime()+9*3600e3).getUTCHours();
  const inHours=h>=HOURS.open||h<HOURS.close;const mode=(st().shop||{}).mode||null;
  let state=!inHours?'closed':(mode==='closed'?'closed':mode==='prep'?'preparing':mode==='shop'?'paused':(mode&&mode!=='open'?'paused':'open'));
  let wait=null,busy=null;
  if(state==='open'){const w=waitEst()||{};const cups=w.cups||0;wait=cups?w.min:0;busy=cups<=3?'low':cups<=8?'mid':'high'}
  // minutes until next open / close (JST)
  const j=new Date(now.getTime()+9*3600e3),mNow=j.getUTCHours()*60+j.getUTCMinutes();
  const toOpen=(HOURS.open*60-mNow+1440)%1440,toClose=(HOURS.close*60-mNow+1440)%1440;
  const minsToOpen=inHours?null:toOpen,minsToClose=inHours?toClose:null;
  // Uber Eats store state reported by the box worker (read-only from Uber Manager). Stale >10 min -> unknown.
  const us=(st().ipad||{}).uberStore;let uber='unknown';
  if(us&&Date.now()-us.at<10*60e3)uber=us.state==='online'?'online':['paused','offline','closed'].includes(us.state)?'offline':'unknown';
  const accepting=state==='open';
  const channels={uber,mobile:accepting?'open':'closed',square:accepting?'open':'closed'};
  return{state,busy,wait,hours:'17:00-02:00',minsToOpen,minsToClose,channels,soldOut:state==='closed'?[]:await soldOut(),at:now.toISOString()};
 }
 return(u,q,r)=>{const H={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'};
  if(q.method==='OPTIONS'){r.writeHead(204,H);return r.end()}
  status().then(d=>{r.writeHead(200,H);r.end(JSON.stringify(d))}).catch(()=>{r.writeHead(500,H);r.end('{"error":"status"}')})};
};
