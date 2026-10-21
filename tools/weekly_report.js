// node tools/weekly_report.js [YYYY-MM-DD monday]  -> prints Chinese weekly report; saves reports/weekly_<start>.txt/.json
const fs=require('fs'),path=require('path'),{compute}=require('../lib/weekly');
const TOK=process.env.SQUARE_ACCESS_TOKEN,LOC=process.env.SQUARE_LOCATION_ID||'LM4FNJNN3XFAH';
const sq=async(p,o={})=>{const r=await fetch('https://connect.squareup.com/v2'+p,{...o,headers:{Authorization:'Bearer '+TOK,'Square-Version':'2025-01-23','Content-Type':'application/json'}});const j=await r.json();if(!r.ok)throw new Error(p+' '+r.status+' '+JSON.stringify(j.errors||j).slice(0,200));return j};
function uber(){const W=process.env.UBER_DIR||'/workspace/uber-sync',out={orders:[],daily:{}};
 try{const c=JSON.parse(fs.readFileSync(path.join(W,'uber_cups_cache.json'),'utf8'));for(const k in c){const o=c[k];if(o&&o.t&&!/CANCEL/i.test(o.status||''))out.orders.push({t:o.t,cups:o.cups||0})}}catch(e){}
 try{const L=fs.readFileSync(path.join(W,'uber_sales_latest.csv'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/),h=L.shift().split(',');for(const l of L){const c=l.split(',');out.daily[c[h.indexOf('Start Date')].slice(0,10)]={rev:+c[h.indexOf('Sales')]||0,orders:+c[h.indexOf('Orders')]||0}}}catch(e){}
 return out}
(async()=>{const R=await compute(sq,LOC,{start:process.argv[2],uber:uber()});const d=path.join(__dirname,'..','reports');fs.mkdirSync(d,{recursive:true});
 fs.writeFileSync(path.join(d,`weekly_${R.range.start}.txt`),R.text+'\n');fs.writeFileSync(path.join(d,`weekly_${R.range.start}.json`),JSON.stringify(R,null,1));console.log(R.text)})().catch(e=>{console.error(e.message);process.exit(1)});
