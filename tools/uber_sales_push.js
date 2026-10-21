// Downloads Uber Manager Performance->Sales CSV (this month) in its own tab on CDP 9226, pushes today+MTD to /api/ipad/uber.
const {chromium}=require('playwright-core'),fs=require('fs'),path=require('path');
const D=__dirname,BASE=process.env.APP||'https://mstand-queue.onrender.com';
const URL='https://merchants.ubereats.com/manager/home/b995d00f-e3a8-46de-99f2-72891a95b816/analytics/sales-v2?dateRange=this_month';
const rd=f=>{try{return fs.readFileSync(path.join(D,f),'utf8').trim()}catch(e){return ''}};
const log=m=>fs.appendFileSync(path.join(D,'uber_sales.log'),new Date().toISOString()+' '+m+'\n');
function bizDay(){const t=new Date(Date.now()+9*3600e3-4*3600e3);return t.toISOString().slice(0,10)}
(async()=>{const b=await chromium.connectOverCDP('http://127.0.0.1:9226');const pg=await b.contexts()[0].newPage();
 try{await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  const btn=pg.getByRole('button',{name:'Download'}).first();await btn.waitFor({timeout:45000});await pg.waitForTimeout(4000);
  const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:45000}),btn.click()]);
  const f=path.join(D,'uber_sales_latest.csv');await dl.saveAs(f);
  const rows=fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);const h=rows.shift().split(',');
  const I=k=>h.indexOf(k),day=bizDay(),mon=day.slice(0,7);let mtd={rev:0,orders:0},today={rev:0,orders:0};
  for(const l of rows){const c=l.split(',');if(!/^(current|this)/i.test(c[I('Period')]))continue;const d=c[I('Start Date')].slice(0,10);if(d.slice(0,7)!==mon)continue;
   const s=Math.round(+c[I('Sales')]||0),o=Math.round(+c[I('Orders')]||0);mtd.rev+=s;mtd.orders+=o;if(d===day){today.rev+=s;today.orders+=o}}
  if(!rows.some(l=>/^(current|this)/i.test(l)))throw new Error('no current-period rows');
  const hd={'content-type':'application/json'},wk=rd('worker.key'),pin=rd('pin.key');if(wk)hd['x-worker-key']=wk;if(pin)hd['x-pin']=pin;
  const r=await fetch(BASE+'/api/ipad/uber',{method:'POST',headers:hd,body:JSON.stringify({today,mtd})});
  log(`push ${r.status} today=${today.rev}/${today.orders} mtd=${mtd.rev}/${mtd.orders}`);console.log(r.status,JSON.stringify({today,mtd}));
 }catch(e){log('ERR '+e.message);console.log('ERR',e.message);process.exitCode=1}finally{await pg.close().catch(()=>{});process.exit()}})();
