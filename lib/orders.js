// Supplier ordering requests. DATA_DIR/orders.json. All endpoints PIN-protected (x-pin).
// The assistant polls GET /api/orders?status=待处理, fills the supplier cart, sets 已放购物车待确认,
// and only places the order (已下单) after the owner confirms.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function({PIN}){
const F=path.join(process.env.DATA_DIR||path.join(__dirname,'..'),'orders.json');
const ST=['待处理','已放购物车待确认','已下单','已取消'];
const NEXT={'待处理':['已放购物车待确认','已下单','已取消'],'已放购物车待确认':['已下单','已取消','待处理'],'已下单':[],'已取消':[]};
const now=()=>new Date().toISOString();const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
const ADDR='池袋店（株式会社ムラド 池袋2-24-5ロックビル104 Mスタンド）';
const I=(code,name,cn,price,unit,def,costName)=>({id:'tw-'+code,code,name,cn,price,unit,category:CAT[code]||'其他',defQty:def,remindDays:null,costName:costName||'',active:true});
const CAT={'1010031000':'珍珠/小料','1010311000':'珍珠/小料','1017071000':'珍珠/小料','1017131000':'珍珠/小料','1020011000':'粉类','1020071000':'粉类','1030041000':'糖浆','1030051000':'糖浆','1030061000':'糖浆','1030071000':'糖浆','1030081000':'糖浆','1030091000':'糖浆','1030111000':'糖浆','1900041000':'其他（常温）','1900081000':'其他（常温）','1900091000':'其他（常温）','1900161010':'其他（常温）','1900171000':'其他（常温）'};
const EXTRA=[
 I('1010311000','大粒生カラータピオカ','彩色珍珠（3kg×4袋）',9115,'箱',0),
 I('1017071000','国産冷凍小粒白玉','国产冷冻小白玉（3kg×4）',10162,'箱',0),
 I('1017131000','タロ芋＆サツマ芋ボール ミックスSet（国産）','芋圆＆地瓜圆套装（1kg×6×2种）',11988,'箱',0),
 I('1020071000','紫いもフレーバーパウダー','紫薯粉（500g×20）',19267,'箱',0),
 I('1030061000','ピーチシロップ','桃子糖浆（1L×6）',7225,'箱',0),
 I('1030071000','ライチシロップ','荔枝糖浆（1L×6）',7225,'箱',0),
 I('1030091000','巨峰シロップ','巨峰葡萄糖浆（1L×6）',7225,'箱',0),
 I('1900081000','仙草ゼリー','仙草冻（540g×24罐）',8320,'箱',0),
 I('1900091000','愛玉ゼリー','爱玉冻（540g×24罐）',8320,'箱',0),
 I('1900161010','タロイモパック（食感あるﾀﾛｲﾓﾌﾞﾛｯｸ(小粒)）','芋头块（500g×30）',19238,'箱',0),
 I('1900171000','ゼリーボバ','寒天晶球（1kg×12）',12247,'箱',0)];
const SEED={rev:0,updatedAt:now(),suppliers:[{id:'tapiocaworld',name:'タピオカワールド',url:'https://tapiocaworld.biz/aec/user/shohin_list',payment:'代金引換',deliveryAddress:ADDR,deliveryDate:'最早',note:'价格不含税',items:[
 I('1010031000','大粒生ブラックタピオカ','黑珍珠（3kg×4袋）',9687,'箱',2,'冷冻珍珠（日本）'),
 I('1030081000','マンゴーシロップ','芒果糖浆（1L×6）',7225,'箱',1,'芒果糖浆'),
 I('1030111000','パッションフルーツシロップ','百香果糖浆（1L×6）',7225,'箱',1,'百香果糖浆'),
 I('1030051000','ストロベリーシロップ','草莓糖浆（1L×6）',7225,'箱',1,'草莓糖浆'),
 I('1030041000','パインシロップ','菠萝糖浆（1L×6）',7225,'箱',1,'菠萝糖浆'),
 I('1020011000','クリーミーパウダー（C）','奶精（500g×40）',24624,'组',1,'奶精/奶粉'),
 I('1900041000','ナタデココ台湾産','椰果（台湾 2kg×8）',13996,'箱',1,'椰果（台湾）')]}],
 orders:[{id:'seed-20261014',supplierId:'tapiocaworld',supplierName:'タピオカワールド',status:'已下单',past:true,createdAt:'2026-10-14T00:00:00.000Z',orderDate:'2026-10-14',deliveryDate:'',comment:'补登记：过去的订单',
  lines:[{itemId:'tw-1010031000',code:'1010031000',name:'大粒生ブラックタピオカ',cn:'黑珍珠（3kg×4袋）',qty:2,unit:'箱',price:9687}],subtotal:19374,taxEst:1550,totalEst:20924,history:[{status:'已下单',at:'2026-10-14T00:00:00.000Z',by:'seed'}]}]};
const O2={id:'tw-00033076',supplierId:'tapiocaworld',supplierName:'タピオカワールド',status:'已下单',past:true,createdAt:'2026-10-22T03:00:00.000Z',orderDate:'2026-10-22',deliveryDate:'2026-10-25',deliveryAddress:ADDR,payment:'代金引換',supplierOrderNo:'00033076',comment:'代引手数料 ¥330',
 lines:[{itemId:'tw-1030051000',code:'1030051000',name:'ストロベリーシロップ',cn:'草莓糖浆（1L×6）',qty:1,unit:'箱',price:7225},{itemId:'tw-1020011000',code:'1020011000',name:'クリーミーパウダー（C）',cn:'奶精（500g×40）',qty:1,unit:'组',price:24624}],subtotal:31849,taxEst:0,codFee:330,totalEst:32179,history:[{status:'已下单',at:'2026-10-22T03:00:00.000Z',by:'seed'}]};
const MARURI={id:'maruri',name:'マルリネット（砂糖屋WebShop maruri.net）',url:'http://maruri.net/member_login.html',payment:'代金引換',deliveryAddress:ADDR,deliveryDate:'最早',taxIncluded:true,note:'价格含税 · ¥10,000以上送料・手数料無料 · 网站仅 http',items:[
 {id:'mr-010461',code:'010461',name:'氷糖蜜 24kg',cn:'冰糖蜜/糖浆（24kg）',price:6900,unit:'个',category:'糖浆',defQty:3,remindDays:null,costName:'冰糖蜜/糖浆',active:true},
 {id:'mr-010205',code:'010205',name:'マルリセレクト三温糖 1kg',cn:'三温糖（1kg）',price:310,unit:'袋',category:'糖类',defQty:20,remindDays:null,costName:'三温糖',active:true}]};
const O3={id:'mr-A02610166002',supplierId:'maruri',supplierName:MARURI.name,status:'已下单',past:true,taxIncluded:true,createdAt:'2026-10-16T03:00:00.000Z',orderDate:'2026-10-16',deliveryDate:'',deliveryAddress:ADDR,payment:'代金引換',supplierOrderNo:'A02610166002',comment:'含税 ¥26,900，积分 -204，实付 ¥26,696，10/19 发货',
 lines:[{itemId:'mr-010461',code:'010461',name:'氷糖蜜 24kg',cn:'冰糖蜜/糖浆（24kg）',qty:3,unit:'个',price:6900},{itemId:'mr-010205',code:'010205',name:'マルリセレクト三温糖 1kg',cn:'三温糖（1kg）',qty:20,unit:'袋',price:310}],subtotal:26900,taxEst:0,points:-204,totalEst:26696,history:[{status:'已下单',at:'2026-10-16T03:00:00.000Z',by:'seed'}]};
let D=null;try{D=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
if(!D||!Array.isArray(D.orders))D=JSON.parse(JSON.stringify(SEED));
// migration: merge new catalog items / defaults / known orders into persisted data (never reset)
(function(){const tw=D.suppliers.find(x=>x.id==='tapiocaworld');if(tw){const have=new Set(tw.items.map(i=>i.code||i.id));
 SEED.suppliers[0].items.concat(EXTRA).forEach(i=>{if(!have.has(i.code))tw.items.push(JSON.parse(JSON.stringify(i)))});
 tw.items.forEach(i=>{if(!i.category)i.category=CAT[i.code]||'其他'});
 tw.items.sort((a,b)=>(a.code||'zz').localeCompare(b.code||'zz'));
 tw.payment='代金引換';tw.deliveryAddress=ADDR;tw.deliveryDate='最早';}
 let mr=D.suppliers.find(x=>x.id==='maruri');if(!mr){mr=JSON.parse(JSON.stringify(MARURI));D.suppliers.push(mr)}else{const h=new Set(mr.items.map(i=>i.code));MARURI.items.forEach(i=>{if(!h.has(i.code))mr.items.push(JSON.parse(JSON.stringify(i)))});mr.payment='代金引換';mr.deliveryAddress=ADDR;mr.deliveryDate='最早';mr.taxIncluded=true;}
 if(!D.orders.some(o=>o.supplierOrderNo==='A02610166002'||o.id===O3.id))D.orders.push(JSON.parse(JSON.stringify(O3)));
 if(!D.orders.some(o=>o.supplierOrderNo==='00033076'||o.id===O2.id))D.orders.push(JSON.parse(JSON.stringify(O2)));})();
const save=()=>{D.rev++;D.updatedAt=now();const t=F+'.tmp';fs.writeFileSync(t,JSON.stringify(D,null,1));fs.renameSync(t,F)};
try{save()}catch(e){console.error('orders save',e.message)}
const s=(v,m)=>String(v==null?'':v).slice(0,m||200).trim();const n=v=>v===''||v==null||isNaN(Number(v))?null:Number(v);
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});r.end(JSON.stringify(o))};
const authOk=pin=>PIN&&pin.length===PIN.length&&crypto.timingSafeEqual(Buffer.from(pin),Buffer.from(PIN));
const sup=id=>D.suppliers.find(x=>x.id===id);
const lastOrder=()=>{const m={};D.orders.forEach(o=>{if(o.status!=='已下单')return;o.lines.forEach(l=>{const d=o.orderDate||o.createdAt.slice(0,10);if(!m[l.itemId]||m[l.itemId]<d)m[l.itemId]=d})});return m};
const out=q=>{const lo=lastOrder();let os=D.orders.slice().sort((a,b)=>a.createdAt<b.createdAt?1:-1);if(q)os=os.filter(o=>o.status===q);
 return {rev:D.rev,updatedAt:D.updatedAt,statuses:ST,suppliers:D.suppliers.map(x=>Object.assign({},x,{items:x.items.map(i=>{const d=lo[i.id]||null;const ds=d?Math.floor((Date.parse(today())-Date.parse(d))/864e5):null;return Object.assign({},i,{lastOrder:d,daysSince:ds,due:!!(i.remindDays&&(ds==null||ds>=i.remindDays))})})})),orders:os}};
const mkLines=(x,lines)=>{const L=[];(lines||[]).forEach(l=>{const i=x.items.find(i=>i.id===l.itemId);const q=Math.floor(n(l.qty)||0);if(i&&q>0&&q<1000)L.push({itemId:i.id,code:i.code,name:i.name,cn:i.cn,qty:q,unit:i.unit,price:i.price})});return L};
const tot=(L,inc)=>{const st=L.reduce((a,l)=>a+(l.price||0)*l.qty,0);if(inc)return {subtotal:st,taxEst:0,totalEst:st,taxIncluded:true};const tx=Math.round(st*0.08);return {subtotal:st,taxEst:tx,totalEst:st+tx}};
return async function(u,q,r){
 let b='';for await(const c of q){b+=c;if(b.length>1e6)return send(r,413,{error:'too big'})}
 let j={};try{j=b?JSON.parse(b):{}}catch(e){return send(r,400,{error:'bad json'})}
 if(!authOk(String(q.headers['x-pin']||'')))return send(r,403,{error:'PIN'});
 const p=u.pathname.replace(/^\/api\/orders\/?/,'');
 try{
 if(q.method==='GET'&&p==='')return send(r,200,out(u.searchParams.get('status')||''));
 if(q.method!=='POST')return send(r,404,{error:'not found'});
 if(p===''){const x=sup(j.supplierId||'tapiocaworld');if(!x)return send(r,400,{error:'供应商不存在'});const L=mkLines(x,j.lines);if(!L.length)return send(r,400,{error:'请至少选一样'});
  const past=j.past===true;const o=Object.assign({id:crypto.randomUUID(),supplierId:x.id,supplierName:x.name,status:past?'已下单':'待处理',past,createdAt:now(),orderDate:past?(s(j.orderDate,10)||today()):'',deliveryDate:s(j.deliveryDate,10)||(past?'':'最早'),deliveryAddress:x.deliveryAddress||ADDR,payment:x.payment,comment:s(j.comment,500),lines:L},tot(L,x.taxIncluded),{history:[{status:past?'已下单':'待处理',at:now(),by:'page'}]});
  D.orders.push(o);save();return send(r,200,Object.assign(out(),{created:o}))}
 let m=p.match(/^([\w-]+)\/status$/);
 if(m){const o=D.orders.find(o=>o.id===m[1]);if(!o)return send(r,404,{error:'不存在'});const st=s(j.status,20);
  if(!ST.includes(st))return send(r,400,{error:'状态无效',allowed:ST});if(st!==o.status&&!NEXT[o.status].includes(st))return send(r,409,{error:'不能从「'+o.status+'」改成「'+st+'」'});
  o.status=st;if(st==='已下单'&&!o.orderDate)o.orderDate=s(j.orderDate,10)||today();if(j.note)o.assistantNote=s(j.note,500);if(j.supplierOrderNo)o.supplierOrderNo=s(j.supplierOrderNo,60);
  o.history.push({status:st,at:now(),by:s(j.by,30)||'api'});save();return send(r,200,Object.assign(out(),{order:o}))}
 if(p==='supplier'){const x=sup(j.id);if(!x)return send(r,404,{error:'不存在'});if(!Array.isArray(j.items))return send(r,400,{error:'items'});
  x.items=j.items.filter(i=>i&&s(i.name)).map(i=>({id:s(i.id,60)||('it-'+crypto.randomUUID().slice(0,8)),code:s(i.code,30),name:s(i.name,80),cn:s(i.cn,80),price:n(i.price),unit:s(i.unit,10)||'箱',defQty:Math.max(0,Math.floor(n(i.defQty)||0)),remindDays:n(i.remindDays)&&n(i.remindDays)>0?Math.floor(n(i.remindDays)):null,category:s(i.category,30)||CAT[s(i.code,30)]||'其他',costName:s(i.costName,80),active:i.active!==false}));
  save();return send(r,200,out())}
 return send(r,404,{error:'not found'})}catch(e){console.error('orders',e.message);return send(r,500,{error:e.message})}
}};
