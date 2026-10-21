// Uber store online state -> POST /api/ipad/uber-status (worker key). Read-only (Uber Manager REST getStores).
// Cookie: env UBER_COOKIE / UBER_COOKIE_FILE (Render cron), or --cdp to take it in-memory from the logged-in Chrome on :9226 (box). Never logs cookies.
// Args: --dry (print only). Exit 3 = Uber login expired (pushes state "unknown" with err).
const fs=require('fs'),path=require('path');
const APP=process.env.APP||'https://mstand-queue.onrender.com',STORE=process.env.UBER_STORE||'b995d00f-e3a8-46de-99f2-72891a95b816';
const rd=f=>{try{return fs.readFileSync(f,'utf8').trim()}catch(e){return ''}};
async function cookie(){let c=(process.env.UBER_COOKIE||(process.env.UBER_COOKIE_FILE&&rd(process.env.UBER_COOKIE_FILE))||'').trim();if(c||!process.argv.includes('--cdp'))return c;
 const {chromium}=require('playwright-core');const b=await chromium.connectOverCDP(process.env.CDP||'http://127.0.0.1:9226',{timeout:15000});
 try{const cs=await b.contexts()[0].cookies('https://merchants.ubereats.com/manager/');return cs.map(x=>x.name+'='+x.value).join('; ')}finally{await b.close().catch(()=>{})}}
async function read(ck){const r=await fetch('https://merchants.ubereats.com/manager/api/getStores?localeCode=en',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(30000),
  headers:{cookie:ck,'content-type':'application/json','x-csrf-token':'x',origin:'https://merchants.ubereats.com','user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'},
  body:JSON.stringify({restaurantsMetadata:[{restaurantId:STORE}],isTopEatsIncluded:false,storeFilters:{dateFilter:{startDate:new Date(Date.now()+5*3600e3).toISOString().slice(0,10),endDate:new Date(Date.now()+29*3600e3).toISOString().slice(0,10)}}})});
 let j=null;try{j=await r.json()}catch(e){}
 const sd=j&&j.data&&(j.data.storeData||[]).find(s=>s.restaurantUuid&&s.restaurantUuid.value===STORE)||(j&&j.data&&j.data.storeData||[])[0];
 // locate the status object anywhere in the store record
 let so=null;(function f(o){if(so||!o||typeof o!=='object')return;for(const k of ['orderabilityStatus','status'])if(typeof o[k]==='string'&&/^STORE_STATUS_/.test(o[k])){so=Object.assign({},o,{status:o[k]});return}for(const k in o)f(o[k])})(sd);
 if(!so){const e=new Error('UBER_LOGIN_EXPIRED status='+r.status);e.code=3;throw e}
 const n=x=>+x||0,now=Date.now(),raw=so.status.replace('STORE_STATUS_',''),reason=(so.reason&&so.reason.value)||'';
 const pu=n(so.pauseUntilTimestamp),bu=n(so.busyUntilTimestamp);
 let state=/PAUSE/.test(raw)||pu>now?'paused':/ONLINE|OPEN|BUSY/.test(raw)?'online':/OFFLINE|CLOSED/.test(raw)?(/HOURS|CLOSED|SCHEDULE/i.test(reason+raw)?'closed':'offline'):'unknown';
 return {state,raw,reason,pauseUntil:pu>now?pu:null,busyUntil:bu>now?bu:null,nextOpen:n(so.nextOpenTimestamp)||null,nextClose:n(so.nextCloseTimestamp)||null,since:n(so.statusUpdatedAt)||null}}
async function push(s){const p=await fetch(APP+'/api/ipad/uber-status',{method:'POST',headers:{'content-type':'application/json','x-worker-key':(process.env.WORKER_KEY||rd(path.join(process.env.UBER_SYNC_DIR||'/workspace/uber-sync','worker.key')))},body:JSON.stringify(s),signal:AbortSignal.timeout(20000)});return p.status}
module.exports={read,cookie,push};
if(require.main===module)(async()=>{const dry=process.argv.includes('--dry');let s,code=0;
 try{const ck=await cookie();if(!ck){console.log('ERR no cookie');process.exit(2)}s=await read(ck)}catch(e){code=e.code||1;s={state:'unknown',err:e.code===3?'login':'read'};console.log('ERR',e.message.slice(0,120))}
 if(dry){console.log('DRY',JSON.stringify(s));process.exit(code)}
 console.log(new Date().toISOString(),'push',await push(s).catch(e=>'ERR '+e.message),JSON.stringify(s));process.exit(code)})();
