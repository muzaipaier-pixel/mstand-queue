// Supplier ordering requests. DATA_DIR/orders.json. All endpoints PIN-protected (x-pin).
// The assistant polls GET /api/orders?status=待处理, fills the supplier cart, sets 已放购物车待确认,
// and only places the order (已下单) after the owner confirms.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function({PIN}){
const F=path.join(process.env.DATA_DIR||path.join(__dirname,'..'),'orders.json');
const ST=['待处理','已放购物车待确认','已下单','已取消'];
const NEXT={'待处理':['已放购物车待确认','已下单','已取消'],'已放购物车待确认':['已下单','已取消','待处理'],'已下单':[],'已取消':[]};
const now=()=>new Date().toISOString();const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
const I=(code,name,cn,price,unit,def,costName)=>({id:'tw-'+code,code,name,cn,price,unit,defQty:def,remindDays:null,costName:costName||'',active:true});
const SEED={rev:0,updatedAt:now(),suppliers:[{id:'tapiocaworld',name:'タピオカワールド',url:'https://tapiocaworld.biz/aec/user/shohin_list',payment:'代金引換',note:'价格不含税',items:[
 I('1010031000','大粒生ブラックタピオカ','黑珍珠（3kg×4袋）',9687,'箱',2,'冷冻珍珠（日本）'),
 I('1030081000','マンゴーシロップ','芒果糖浆（1L×6）',7225,'箱',1,'芒果糖浆'),
 I('1030111000','パッションフルーツシロップ','百香果糖浆（1L×6）',7225,'箱',1,'百香果糖浆'),
 I('1030051000','ストロベリーシロップ','草莓糖浆（1L×6）',7225,'箱',1,'草莓糖浆'),
 I('1030041000','パインシロップ','菠萝糖浆（1L×6）',7225,'箱',1,'菠萝糖浆'),
 I('1020011000','クリーミーパウダー（C）','奶精（500g×40）',24624,'组',1,'奶精/奶粉'),
 I('1900041000','ナタデココ台湾産','椰果（台湾 2kg×8）',13996,'箱',1,'椰果（台湾）')]}],
 orders:[{id:'seed-20261014',supplierId:'tapiocaworld',supplierName:'タピオカワールド',status:'已下单',past:true,createdAt:'2026-10-14T00:00:00.000Z',orderDate:'2026-10-14',deliveryDate:'',comment:'补登记：过去的订单',
  lines:[{itemId:'tw-1010031000',code:'1010031000',name:'大粒生ブラックタピオカ',cn:'黑珍珠（3kg×4袋）',qty:2,unit:'箱',price:9687}],subtotal:19374,taxEst:1550,totalEst:20924,history:[{status:'已下单',at:'2026-10-14T00:00:00.000Z',by:'seed'}]}]};
let D=null;try{D=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
if(!D||!Array.isArray(D.orders))D=JSON.parse(JSON.stringify(SEED));
const save=()=>{D.rev++;D.updatedAt=now();const t=F+'.tmp';fs.writeFileSync(t,JSON.stringify(D,null,1));fs.renameSync(t,F)};
const s=(v,m)=>String(v==null?'':v).slice(0,m||200).trim();const n=v=>v===''||v==null||isNaN(Number(v))?null:Number(v);
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});r.end(JSON.stringify(o))};
const authOk=pin=>PIN&&pin.length===PIN.length&&crypto.timingSafeEqual(Buffer.from(pin),Buffer.from(PIN));
const sup=id=>D.suppliers.find(x=>x.id===id);
const lastOrder=()=>{const m={};D.orders.forEach(o=>{if(o.status!=='已下单')return;o.lines.forEach(l=>{const d=o.orderDate||o.createdAt.slice(0,10);if(!m[l.itemId]||m[l.itemId]<d)m[l.itemId]=d})});return m};
const out=q=>{const lo=lastOrder();let os=D.orders.slice().sort((a,b)=>a.createdAt<b.createdAt?1:-1);if(q)os=os.filter(o=>o.status===q);
 return {rev:D.rev,updatedAt:D.updatedAt,statuses:ST,suppliers:D.suppliers.map(x=>Object.assign({},x,{items:x.items.map(i=>{const d=lo[i.id]||null;const ds=d?Math.floor((Date.parse(today())-Date.parse(d))/864e5):null;return Object.assign({},i,{lastOrder:d,daysSince:ds,due:!!(i.remindDays&&(ds==null||ds>=i.remindDays))})})})),orders:os}};
const mkLines=(x,lines)=>{const L=[];(lines||[]).forEach(l=>{const i=x.items.find(i=>i.id===l.itemId);const q=Math.floor(n(l.qty)||0);if(i&&q>0&&q<1000)L.push({itemId:i.id,code:i.code,name:i.name,cn:i.cn,qty:q,unit:i.unit,price:i.price})});return L};
const tot=L=>{const st=L.reduce((a,l)=>a+(l.price||0)*l.qty,0);const tx=Math.round(st*0.08);return {subtotal:st,taxEst:tx,totalEst:st+tx}};
return async function(u,q,r){
 let b='';for await(const c of q){b+=c;if(b.length>1e6)return send(r,413,{error:'too big'})}
 let j={};try{j=b?JSON.parse(b):{}}catch(e){return send(r,400,{error:'bad json'})}
 if(!authOk(String(q.headers['x-pin']||'')))return send(r,403,{error:'PIN'});
 const p=u.pathname.replace(/^\/api\/orders\/?/,'');
 try{
 if(q.method==='GET'&&p==='')return send(r,200,out(u.searchParams.get('status')||''));
 if(q.method!=='POST')return send(r,404,{error:'not found'});
 if(p===''){const x=sup(j.supplierId||'tapiocaworld');if(!x)return send(r,400,{error:'供应商不存在'});const L=mkLines(x,j.lines);if(!L.length)return send(r,400,{error:'请至少选一样'});
  const past=j.past===true;const o=Object.assign({id:crypto.randomUUID(),supplierId:x.id,supplierName:x.name,status:past?'已下单':'待处理',past,createdAt:now(),orderDate:past?(s(j.orderDate,10)||today()):'',deliveryDate:s(j.deliveryDate,10),comment:s(j.comment,500),lines:L},tot(L),{history:[{status:past?'已下单':'待处理',at:now(),by:'page'}]});
  D.orders.push(o);save();return send(r,200,Object.assign(out(),{created:o}))}
 let m=p.match(/^([\w-]+)\/status$/);
 if(m){const o=D.orders.find(o=>o.id===m[1]);if(!o)return send(r,404,{error:'不存在'});const st=s(j.status,20);
  if(!ST.includes(st))return send(r,400,{error:'状态无效',allowed:ST});if(st!==o.status&&!NEXT[o.status].includes(st))return send(r,409,{error:'不能从「'+o.status+'」改成「'+st+'」'});
  o.status=st;if(st==='已下单'&&!o.orderDate)o.orderDate=s(j.orderDate,10)||today();if(j.note)o.assistantNote=s(j.note,500);if(j.supplierOrderNo)o.supplierOrderNo=s(j.supplierOrderNo,60);
  o.history.push({status:st,at:now(),by:s(j.by,30)||'api'});save();return send(r,200,Object.assign(out(),{order:o}))}
 if(p==='supplier'){const x=sup(j.id);if(!x)return send(r,404,{error:'不存在'});if(!Array.isArray(j.items))return send(r,400,{error:'items'});
  x.items=j.items.filter(i=>i&&s(i.name)).map(i=>({id:s(i.id,60)||('it-'+crypto.randomUUID().slice(0,8)),code:s(i.code,30),name:s(i.name,80),cn:s(i.cn,80),price:n(i.price),unit:s(i.unit,10)||'箱',defQty:Math.max(0,Math.floor(n(i.defQty)||0)),remindDays:n(i.remindDays)&&n(i.remindDays)>0?Math.floor(n(i.remindDays)):null,costName:s(i.costName,80),active:i.active!==false}));
  save();return send(r,200,out())}
 return send(r,404,{error:'not found'})}catch(e){console.error('orders',e.message);return send(r,500,{error:e.message})}
}};
