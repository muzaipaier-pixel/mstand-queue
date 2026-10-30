// Public read-only live store status for the website. No sales/order data, only coarse state.
const NAMES=require('./names');
const HOURS={open:16,close:2}; // JST, closes next day 02:00
module.exports=function({st,waitEst,menu}){
 let soC={at:0,v:[]};
 async function soldOut(){if(Date.now()-soC.at<60e3)return soC.v;try{const items=await menu();
   soC.v=items.filter(i=>i.vars&&i.vars.length&&i.vars.every(v=>v.so)).map(i=>{const t=NAMES[i.name]||[i.name,i.name];return{ja:i.name,zh:t[0],en:t[1]}});soC.at=Date.now()}catch(e){}return soC.v}
 async function status(){
  const now=new Date(),h=new Date(now.getTime()+9*3600e3).getUTCHours();
  const inHours=h>=HOURS.open||h<HOURS.close;const mode=(st().shop||{}).mode||null;
  let state=!inHours?'closed':(mode==='closed'?'closed':mode==='prep'?'preparing':mode==='shop'?'paused':(mode&&mode!=='open'?'paused':'open'));
  let wait=null,busy=null;
  if(state==='open'){const w=waitEst()||{};const cups=w.cups||0;wait=cups?w.min:0;busy=cups<=3?'low':cups<=8?'mid':'high'}
  return{state,busy,wait,hours:'16:00-02:00',soldOut:state==='closed'?[]:await soldOut(),at:now.toISOString()};
 }
 return(u,q,r)=>{const H={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'};
  if(q.method==='OPTIONS'){r.writeHead(204,H);return r.end()}
  status().then(d=>{r.writeHead(200,H);r.end(JSON.stringify(d))}).catch(()=>{r.writeHead(500,H);r.end('{"error":"status"}')})};
};
