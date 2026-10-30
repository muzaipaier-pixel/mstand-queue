// Public read-only "popular drinks" for the website. Exposes names/images/rank only — no prices or counts.
const TTL=8*3600e3, DAYS=30, N=5;
// Normalized-name keyword -> site entry. Order matters (first match wins).
const MAP=[
 [/楊枝|杨枝|ポメロ|pomelo|sago/i,{k:'yangzhi',img:'img/yangzhi.jpg',ja:'楊枝甘露',zh:'杨枝甘露',en:'Mango Pomelo Sago',en2:'MANGO POMELO SAGO'}],
 [/アボカド|牛油果|avocado/i,{k:'avocado',img:'img/avocado.jpg',ja:'アボカドミルク',zh:'牛油果牛奶',en:'Avocado Milk',en2:'AVOCADO MILK'}],
 [/チーズ|芝士|cheese/i,{k:'cheese',img:'img/cheese.jpg',ja:'チーズティー',zh:'芝士奶盖茶',en:'Cheese Foam Tea',en2:'CHEESE FOAM TEA'}],
 [/いちご|イチゴ|苺|草莓|strawberry/i,{k:'strawberry',img:'img/strawberry.jpg',ja:'いちごミルク',zh:'草莓牛奶',en:'Strawberry Milk',en2:'STRAWBERRY MILK'}],
 [/パッション|百香果|passion/i,{k:'passion',img:'img/passion.jpg',ja:'パッションフルーツティー',zh:'百香果茶',en:'Passion Fruit Tea',en2:'PASSION FRUIT TEA'}],
 [/マンゴー|芒果|mango/i,{k:'mango',img:'img/mango.jpg',ja:'マンゴーミルク',zh:'芒果牛奶',en:'Mango Milk',en2:'MANGO MILK'}],
];
const DEFAULT=['mango','strawberry','yangzhi','cheese','avocado'];
const SKIP=/袋|bag|トッピング|topping|加料|追加|ストロー|カスタム|gift|ギフト/i;
const NAMES=require('./names');
module.exports=function({sq,LOC,menu}){
 let C={at:0,data:null,p:null};
 async function compute(){
  const start=new Date(Date.now()-DAYS*864e5).toISOString();const cnt={};let cursor,pages=0;
  do{const j=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],cursor,limit:500,query:{filter:{state_filter:{states:['COMPLETED']},date_time_filter:{closed_at:{start_at:start}}},sort:{sort_field:'CLOSED_AT',sort_order:'DESC'}}})});
   for(const o of j.orders||[])for(const li of o.line_items||[]){const n=(li.name||'').trim();if(!n||SKIP.test(n))continue;cnt[n]=(cnt[n]||0)+Number(li.quantity||1)}
   cursor=j.cursor;pages++}while(cursor&&pages<40);
  const ranked=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  let imgs={};try{(await menu()).forEach(i=>{if(i.img)imgs[i.name]=i.img})}catch(e){}
  const out=[];
  for(const [n] of ranked){if(out.length>=N)break;if(!NAMES[n]&&!imgs[n])continue; // only current catalog drinks
   const m=MAP.find(([re])=>re.test(n)),t=NAMES[n]||[n,n];
   out.push({key:m?m[1].k:null,img:imgs[n]||(m?m[1].img:null),label:t[1].toUpperCase(),name:{ja:n,zh:t[0],en:t[1]},square:n})}
  return {ranked,out};
 }
 async function get(){
  if(C.data&&Date.now()-C.at<TTL)return C.data;
  if(!C.p)C.p=compute().then(({out})=>{const items=out.map(({square,...x})=>x);C.data={source:'square',days:DAYS,updated:new Date().toISOString(),items};C.at=Date.now();return C.data}).finally(()=>{C.p=null});
  try{return await C.p}catch(e){console.error('popular',e.message);return C.data||{source:'default',items:DEFAULT.map(k=>{const m=MAP.find(x=>x[1].k===k)[1];return{key:k,img:m.img,label:m.en2,name:{ja:m.ja,zh:m.zh,en:m.en}}})}}
 }
 const handler=(u,q,r)=>{const H={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600'};
  if(q.method==='OPTIONS'){r.writeHead(204,H);return r.end()}
  if(q.method!=='GET'){r.writeHead(405,H);return r.end('{"error":"method"}')}
  get().then(d=>{r.writeHead(200,H);r.end(JSON.stringify(d))}).catch(()=>{r.writeHead(500,H);r.end('{"error":"popular"}')})};
 handler.compute=compute;return handler;
};
