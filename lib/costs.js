// Ingredient purchase-price registry. Stored in DATA_DIR/costs.json (separate from state.json).
// All endpoints PIN-protected (header x-pin). Server keeps rev+updatedAt so the client's
// localStorage copy can restore data if the server disk was wiped (Render free disk is ephemeral).
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function({PIN}){
const F=path.join(process.env.DATA_DIR||path.join(__dirname,'..'),'costs.json');
const P=(c,n,ja,s,q,u,note)=>({c,n,ja:ja||'',spec:s,qty:q,unit:u,note:note||''});
const SEED=[
 P('水果','牛油果','アボカド','1个',1,'个'),P('水果','芒果（秘鲁）','マンゴー','1kg',1000,'g'),P('水果','草莓（美国）','いちご','1kg',1000,'g'),
 P('水果','蓝莓','ブルーベリー','1kg',1000,'g'),P('水果','混合莓果','ミックスベリー','1kg',1000,'g'),P('水果','车厘子','チェリー','1kg',1000,'g'),
 P('水果','百香果（台湾）','パッションフルーツ','1kg',1000,'g'),P('水果','柚子','ザボン','1kg',1000,'g'),P('水果','青柠','ライム','1个',1,'个'),
 P('茶叶','茉莉花茶（台湾）','ジャスミン茶','1kg',1000,'g'),P('茶叶','四季春（台湾）','四季春茶','1kg',1000,'g'),P('茶叶','红茶（台湾）','紅茶','1kg',1000,'g'),
 P('茶叶','乌龙茶（台湾）','烏龍茶','1kg',1000,'g'),P('茶叶','洛神花（福建）','ハイビスカス','1kg',1000,'g'),
 P('糖','马印冰糖蜜','氷糖蜜','1kg',1000,'g'),P('糖','三温糖','三温糖','1kg',1000,'g'),P('糖','黑糖','黒糖','1kg',1000,'g'),P('糖','冬瓜块（冬瓜砖）','冬瓜ブロック','1kg',1000,'g'),
 P('乳制品','牛奶','牛乳','1L',1000,'ml'),P('乳制品','奶油奶酪','クリームチーズ','1kg',1000,'g'),P('乳制品','淡奶油','生クリーム','1L',1000,'ml'),
 P('乳制品','北海道炼乳','練乳','1kg',1000,'g'),P('乳制品','奶精/奶粉','クリーマー','1kg',1000,'g','奶茶茶底用，按实际填写'),
 P('小料','冷冻珍珠（日本）','冷凍タピオカ','1kg',1000,'g'),P('小料','椰果（台湾）','ナタデココ','1kg',1000,'g'),P('小料','脆波波（台湾）','クリスタルボール','1kg',1000,'g'),
 P('小料','寒天晶球','寒天ボール','1kg',1000,'g'),P('小料','西米（泰国）','タピオカパール小','1kg',1000,'g'),P('小料','芝士奶盖粉/奶盖原料','チーズフォーム','1kg',1000,'g'),
 P('其他','冰块','氷','1袋',1,'袋'),
 P('包材','杯子 M','カップM','1箱',1000,'个'),P('包材','杯子 L','カップL','1箱',1000,'个'),P('包材','杯盖','フタ','1箱',1000,'个'),
 P('包材','吸管','ストロー','1箱',1000,'根'),P('包材','封口膜','シーリングフィルム','1卷',2000,'张'),P('包材','袋子','袋','1包',100,'个'),
];
const now=()=>new Date().toISOString();const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
let D=null;
try{D=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
if(!D||!Array.isArray(D.items)){D={rev:0,updatedAt:now(),seeded:true,items:SEED.map(s=>({id:crypto.randomUUID(),cat:s.c,name:s.n,ja:s.ja,spec:s.spec,qty:s.qty,unit:s.unit,price:null,taxIncl:true,supplier:'',date:'',note:s.note,history:[]}))};}
const save=()=>{D.rev++;D.updatedAt=now();D.seeded=false;const t=F+'.tmp';fs.writeFileSync(t,JSON.stringify(D));fs.renameSync(t,F)};
const num=v=>v===''||v==null||isNaN(Number(v))?null:Number(v);
const clean=(j,old)=>{const o=old||{id:crypto.randomUUID(),history:[]};const s=(v,m)=>String(v==null?'':v).slice(0,m||200).trim();
 o.cat=s(j.cat,40)||'其他';o.name=s(j.name,80);o.ja=s(j.ja,80);o.spec=s(j.spec,40);o.qty=num(j.qty);o.unit=s(j.unit,10)||'个';
 const p=num(j.price),tx=j.taxIncl!==false;
 if(old&&(p!==old.price||tx!==old.taxIncl)&&p!=null)o.history.push({date:s(j.date,10)||today(),price:p,taxIncl:tx,spec:o.spec,qty:o.qty,at:now()});
 if(!old&&p!=null)o.history.push({date:s(j.date,10)||today(),price:p,taxIncl:tx,spec:o.spec,qty:o.qty,at:now()});
 o.price=p;o.taxIncl=tx;o.supplier=s(j.supplier,80);o.date=s(j.date,10)||(p!=null?now().slice(0,10):'');o.note=s(j.note,300);return o};
const unitCost=i=>i.price!=null&&i.qty>0?i.price/i.qty:null;
const csv=()=>{const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
 return '\ufeff'+[['分类','名称','日文','规格','数量','单位','价格','含税','单价(¥/单位)','供应商','更新日期','备注','历史'].map(q).join(',')]
 .concat(D.items.map(i=>[i.cat,i.name,i.ja,i.spec,i.qty,i.unit,i.price,i.taxIncl?'含税':'税抜',unitCost(i)==null?'':unitCost(i).toFixed(4),i.supplier,i.date,i.note,i.history.map(h=>h.date+':¥'+h.price).join(' ')].map(q).join(','))).join('\r\n')};
const send=(r,c,o,ct)=>{r.writeHead(c,{'Content-Type':ct||'application/json; charset=utf-8','Cache-Control':'no-store'});r.end(typeof o==='string'?o:JSON.stringify(o))};
const authOk=pin=>PIN&&pin.length===PIN.length&&crypto.timingSafeEqual(Buffer.from(pin),Buffer.from(PIN));
return async function(u,q,r){
 let b='';for await(const c of q){b+=c;if(b.length>2e6)return send(r,413,{error:'too big'})}
 let j={};try{j=b?JSON.parse(b):{}}catch(e){return send(r,400,{error:'bad json'})}
 if(!authOk(String(q.headers['x-pin']||'')))return send(r,403,{error:'PIN'});
 const p=u.pathname.replace(/^\/api\/costs\/?/,'');
 const out=()=>({rev:D.rev,updatedAt:D.updatedAt,seeded:!!D.seeded,items:D.items.map(i=>Object.assign({},i,{unitCost:unitCost(i)}))});
 try{
 if(q.method==='GET'&&(p===''||p==='export.json')){if(p)r.setHeader('Content-Disposition','attachment; filename="mstand_costs.json"');return send(r,200,out())}
 if(q.method==='GET'&&p==='export.csv'){r.setHeader('Content-Disposition','attachment; filename="mstand_costs.csv"');return send(r,200,csv(),'text/csv; charset=utf-8')}
 if(q.method!=='POST')return send(r,404,{error:'not found'});
 if(p==='save'){if(!String(j.name||'').trim())return send(r,400,{error:'名称必填'});const old=j.id&&D.items.find(i=>i.id===j.id);if(j.id&&!old)return send(r,404,{error:'不存在'});
  const o=clean(j,old);if(!old)D.items.push(o);save();return send(r,200,out())}
 if(p==='delete'){if(j.confirm!==true)return send(r,400,{error:'confirm required'});const n=D.items.length;D.items=D.items.filter(i=>i.id!==j.id);if(D.items.length===n)return send(r,404,{error:'不存在'});save();return send(r,200,out())}
 if(p==='import'){if(j.confirm!==true||!Array.isArray(j.items))return send(r,400,{error:'confirm required'});
  D.items=j.items.filter(i=>i&&i.name).map(i=>{const o=clean(i,null);o.id=String(i.id||o.id).slice(0,60);o.history=Array.isArray(i.history)?i.history.slice(-200):[];o.date=String(i.date||'').slice(0,10);return o});save();return send(r,200,out())}
 return send(r,404,{error:'not found'})}catch(e){console.error('costs',e.message);return send(r,500,{error:e.message})}
}};
