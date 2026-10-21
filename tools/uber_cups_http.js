// HTTP port of box uber-sync/uber_cups.js (pg = {cookie}). Uber cup counts: list this month's orders (getHistoricOrders) + per-order OrderDetails (cached), count top-level items (toppings are customizations, not counted).
const fs=require('fs'),path=require('path');const D=__dirname,CF=process.env.UBER_CUPS_CACHE||'/tmp/uber_cups_cache.json';
const STORE='b995d00f-e3a8-46de-99f2-72891a95b816',Q=JSON.parse(fs.readFileSync(path.join(D,'uber_orderdetails_query.json'),'utf8'));
const NONCUP=/袋|bag|カトラリー|cutlery|ギフト|gift/i;
const bizDay=ms=>new Date(ms+5*3600e3).toISOString().slice(0,10); // JST, day starts 04:00
module.exports=async function(pg,day){const mon=day.slice(0,7);let cache={};try{cache=JSON.parse(fs.readFileSync(CF,'utf8'))}catch(e){}
 const call=async(url,b)=>{const r=await fetch('https://merchants.ubereats.com'+url,{method:'POST',redirect:'manual',signal:AbortSignal.timeout(30000),headers:{cookie:pg.cookie,'content-type':'application/json','x-csrf-token':'x',origin:'https://merchants.ubereats.com','user-agent':'Mozilla/5.0 Chrome/130.0'},body:JSON.stringify(b)});return r.json()};
 const start=mon+'-01 00:00:00',end=new Date(Date.parse(day)+2*864e5).toISOString().slice(0,10)+' 23:59:59';
 let list=[],pag=null,pi={cursor:'',limit:50,nextTable:'liveOrders'};
 for(let n=0;n<40;n++){const b={filters:{currentTab:'',displayCurrencyCode:'',locationConstraints:{cities:[],countries:[],locationUuids:[STORE]},dateFilter:{startDate:start,endDate:end,lastUpdatedAt:''},isEatsPassSubscriber:false,search:null,orderIssuesV2:[],issueOrderStatusFilter:[],displayByocIssues:false},sort:{sortColumn:'SORT_COLUMN_ORDER_COMPLETED_AT',sortDirection:'SORT_DIRECTION_DESC'},pagingInfo:{cursor:'',limit:50,nextTable:'liveOrders'}};
  if(pag)b.pagination=pag;const j=await call('/manager/api/getHistoricOrders?localeCode=en',b);if(j.status!=='success')throw new Error('historic '+JSON.stringify(j).slice(0,200));
  list=list.concat(j.data.orders||[]);const pr=j.data.paginationResult||{};if(!pr.nextCursor||pr.nextTable==='None')break;pag={cursor:pr.nextCursor,nextTable:pr.nextTable,limit:50}}
 const seen=new Set();list=list.filter(o=>!seen.has(o.workflowUuid)&&seen.add(o.workflowUuid));
 const todo=list.filter(o=>!(cache[o.workflowUuid]&&cache[o.workflowUuid].final));const W=+process.env.UBER_CUPS_CONC||6;
 await Promise.all(Array.from({length:W},async()=>{for(let o;(o=todo.shift());){try{
  const b=JSON.parse(JSON.stringify(Q));b.variables.workflowUUID=o.workflowUuid;
  const j=await call('/manager/graphql?op=OrderDetails',b);const d=j&&j.data&&j.data.orderDetails;if(!d)return;
  const cups=(d.items||[]).reduce((a,i)=>a+(NONCUP.test(i.name||'')?0:(+i.quantity||0)),0);
  const st=o.orderStatus||'';cache[o.workflowUuid]={t:(+d.requestedAt||0)*1000,cups,status:st,final:/COMPLETED|CANCEL|MISSED|FAIL/.test(st)};
  }catch(e){}}}));
 fs.writeFileSync(CF,JSON.stringify(cache));
 const r={today:{orders:0,cups:0},mtd:{orders:0,cups:0}};
 for(const o of list){const c=cache[o.workflowUuid];if(!c||/CANCEL|MISSED|FAIL/.test(c.status))continue;const d=bizDay(c.t);if(d.slice(0,7)!==mon||d>day)continue;
  r.mtd.orders++;r.mtd.cups+=c.cups;if(d===day){r.today.orders++;r.today.cups+=c.cups}}
 return r};
