// Receipt photo inbox. Images in DATA_DIR/receipts/<ts>-<rand>.jpg, index in DATA_DIR/receipts/index.json.
// All endpoints PIN-protected (x-pin). Upload: POST /api/receipts, body = raw JPEG (Content-Type image/*),
// note in header x-note (encodeURIComponent). Client downscales to ~1600px so files stay ~200-500KB.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function({PIN}){
const DIR=path.join(process.env.DATA_DIR||path.join(__dirname,'..'),'receipts'),IX=path.join(DIR,'index.json');
fs.mkdirSync(DIR,{recursive:true});
let L=[];try{L=JSON.parse(fs.readFileSync(IX,'utf8'))}catch(e){}
const save=()=>{const t=IX+'.tmp';fs.writeFileSync(t,JSON.stringify(L));fs.renameSync(t,IX)};
const MAX=10*1024*1024,QUOTA=300*1024*1024; // per-file 10MB; total receipts dir capped at 300MB
const used=()=>L.reduce((s,x)=>s+(x.size||0),0);
// keep disk small: when over quota, drop oldest already-processed (已录入) images (index entry kept, file:null)
const prune=()=>{for(const x of L.slice().sort((a,b)=>a.uploadedAt<b.uploadedAt?-1:1)){if(used()<=QUOTA)break;
 if(x.status==='已录入'&&x.file){try{fs.unlinkSync(path.join(DIR,x.file))}catch(e){}x.file=null;x.size=0}}};
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});r.end(JSON.stringify(o))};
const authOk=pin=>PIN&&pin.length===PIN.length&&crypto.timingSafeEqual(Buffer.from(pin),Buffer.from(PIN));
const ST=['待识别','已录入','需确认'];
return async function(u,q,r){
 if(!authOk(String(q.headers['x-pin']||'')))return send(r,403,{error:'PIN'});
 const p=u.pathname.replace(/^\/api\/receipts\/?/,'');
 try{
 if(q.method==='GET'&&p===''){const s=u.searchParams.get('status');return send(r,200,{used:used(),items:L.filter(x=>!s||x.status===s).slice().reverse()})}
 let m=p.match(/^([\w-]+)\/image$/);
 if(q.method==='GET'&&m){const x=L.find(x=>x.id===m[1]);if(!x||!x.file)return send(r,404,{error:'not found'});
  return fs.readFile(path.join(DIR,x.file),(e,d)=>{if(e)return send(r,404,{error:'missing'});r.writeHead(200,{'Content-Type':'image/jpeg','Content-Length':d.length,'Cache-Control':'private, max-age=86400'});r.end(d)})}
 if(q.method==='POST'&&p===''){
  if(!/^image\//.test(String(q.headers['content-type']||'')))return send(r,415,{error:'image only'});
  if(Number(q.headers['content-length']||0)>MAX)return send(r,413,{error:'文件超过 10MB'});
  const bufs=[];let n=0;for await(const c of q){n+=c.length;if(n>MAX)return send(r,413,{error:'文件超过 10MB'});bufs.push(c)}
  const d=Buffer.concat(bufs);if(d.length<100||d[0]!==0xFF||d[1]!==0xD8)return send(r,400,{error:'不是 JPEG'});
  let note='';try{note=decodeURIComponent(String(q.headers['x-note']||''))}catch(e){}note=note.slice(0,200).trim();
  const ts=new Date(Date.now()+9*3600e3).toISOString().replace(/[-:T]/g,'').slice(0,14),rnd=crypto.randomBytes(3).toString('hex');
  const id=ts+'-'+rnd,file=id+'.jpg';fs.writeFileSync(path.join(DIR,file),d);
  const x={id,file,note,uploadedAt:new Date().toISOString(),status:'待识别',size:d.length,result:''};L.push(x);prune();save();return send(r,200,{ok:true,item:x})}
 m=p.match(/^([\w-]+)\/status$/);
 if(q.method==='POST'&&m){let b='';for await(const c of q){b+=c;if(b.length>2e4)return send(r,413,{error:'too big'})}
  let j={};try{j=JSON.parse(b||'{}')}catch(e){return send(r,400,{error:'bad json'})}
  const x=L.find(x=>x.id===m[1]);if(!x)return send(r,404,{error:'not found'});
  if(!ST.includes(j.status))return send(r,400,{error:'status must be 已录入|需确认|待识别'});
  x.status=j.status;x.result=String(j.result||'').slice(0,2000);x.updatedAt=new Date().toISOString();prune();save();return send(r,200,{ok:true,item:x})}
 return send(r,404,{error:'not found'});
 }catch(e){console.error('receipts',e.message);return send(r,500,{error:'server'})}
}};
