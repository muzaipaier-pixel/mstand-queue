// Render Cron: browserless Uber sales push. Uber Manager GraphQL SalesOverTime via session cookie -> POST /api/ipad/uber.
// Env: UBER_COOKIE (Cookie header from logged-in merchants.ubereats.com), WORKER_KEY, optional APP, UBER_STORE.
// Exit 3 = Uber session expired (no data pushed -> iPad Uber数据 dot goes stale/yellow). Never logs cookie values.
const fs=require('fs'),path=require('path');
const APP=process.env.APP||'https://mstand-queue.onrender.com',STORE=process.env.UBER_STORE||'b995d00f-e3a8-46de-99f2-72891a95b816';
const COOKIE=(process.env.UBER_COOKIE||(process.env.UBER_COOKIE_FILE&&fs.readFileSync(process.env.UBER_COOKIE_FILE,'utf8'))||'').trim();
const QUERY=fs.readFileSync(path.join(__dirname,'uber_sales_query.graphql'),'utf8');
const jst=()=>new Date(Date.now()+9*3600e3);const bizDay=()=>new Date(Date.now()+5*3600e3).toISOString().slice(0,10);
(async()=>{
 if(!COOKIE){console.log('ERR UBER_COOKIE missing');process.exit(2)}
 const day=bizDay(),start=day.slice(0,8)+'01',end=jst().toISOString().slice(0,10);
 const body={operationName:'SalesOverTime',query:QUERY,variables:{widgetTabbedInput:{dateRange:{start,end},locationConstraints:{countries:[],cities:[],locationUUIDs:[STORE]},displayCurrencyCode:'JPY',isMerchantsSelectedInCountry:true,previousRangeAlignment:'ALIGN_TO_WEEKDAY',useYearOnYearComparison:false}}};
 const r=await fetch('https://merchants.ubereats.com/manager/graphql?op=SalesOverTime',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(30000),
  headers:{cookie:COOKIE,'content-type':'application/json','x-csrf-token':'x',origin:'https://merchants.ubereats.com','user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'},body:JSON.stringify(body)});
 let j=null;try{j=await r.json()}catch(e){}
 const sw=j&&j.data&&j.data.salesOverTime&&j.data.salesOverTime.subWidgets;
 if(!sw){console.log('UBER_LOGIN_EXPIRED status='+r.status+' '+(j&&j.errors?JSON.stringify(j.errors).slice(0,150):''));process.exit(3)}
 const cur=w=>(w.visualization.periods||[]).find(p=>p.start===start)||w.visualization.periods[0];
 const sum=pts=>Math.round(pts.reduce((a,p)=>a+(+p.y||0),0)),pick=(pts,d)=>Math.round(+((pts.find(p=>p.dateTime===d)||{}).y||0));
 const S=cur(sw[0]).points,O=cur(sw[1]).points;
 const today={rev:pick(S,day),orders:pick(O,day)},mtd={rev:sum(S.filter(p=>p.dateTime.slice(0,7)===day.slice(0,7))),orders:sum(O.filter(p=>p.dateTime.slice(0,7)===day.slice(0,7)))};
 try{const c=await require('./uber_cups_http')({cookie:COOKIE},day);today.cups=c.today.cups;mtd.cups=c.mtd.cups;today.orders=c.today.orders;mtd.orders=c.mtd.orders}catch(e){console.log('cups ERR '+e.message.slice(0,120))}
 if(process.argv.includes('--dry')){console.log('DRY',JSON.stringify({today,mtd}));return}
 const p=await fetch(APP+'/api/ipad/uber',{method:'POST',headers:{'content-type':'application/json','x-worker-key':(process.env.WORKER_KEY||'').trim()},body:JSON.stringify({today,mtd}),signal:AbortSignal.timeout(30000)});
 console.log('push',p.status,JSON.stringify({today,mtd}));if(!p.ok)process.exit(1)
})().catch(e=>{console.log('ERR',e.message);process.exit(1)});
