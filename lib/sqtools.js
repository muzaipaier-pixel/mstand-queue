// Square Terminal / Kiosk tools (PREVIEW). All write actions are dry-run unless env flags are set:
//  SQ_TERMINAL_LIVE=1  -> really create Terminal checkouts
//  SOLDOUT_LIVE=1      -> really toggle sold-out on Square (+ queue Uber request)
// x-pin required on every endpoint.
const crypto=require('crypto');
module.exports=function({sq,LOC,PIN}){
const JST=9*3600e3, DEVICE=process.env.SQ_TERMINAL_DEVICE||'450CS145C1000868';
const cache={};
async function orders(days=60){
 const c=cache[days];if(c&&Date.now()-c.at<10*60e3)return c.orders;
 const out=[];let cursor;const start=new Date(Date.now()-days*86400e3).toISOString();
 for(let i=0;i<40;i++){const j=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:500,cursor,query:{filter:{state_filter:{states:['COMPLETED']},date_time_filter:{closed_at:{start_at:start}}},sort:{sort_field:'CLOSED_AT'}}})});(j.orders||[]).forEach(o=>out.push(o));cursor=j.cursor;if(!cursor)break}
 cache[days]={orders:out,at:Date.now()};return out}
const chan=o=>{const n=(o.source&&o.source.name)||'';return /kiosk/i.test(n)?'Kiosk':/point of sale/i.test(n)||!n?'收银台':/online|スマホ/i.test(n)?'线上':'其他'};
const amt=o=>((o.total_money||{}).amount||0);
async function channels(days=30){
 const os=(await orders(60)).filter(o=>Date.parse(o.closed_at)>Date.now()-days*86400e3);
 const by={};for(const o of os){const c=chan(o);const b=by[c]||(by[c]={channel:c,n:0,sum:0,hours:Array(24).fill(0)});b.n++;b.sum+=amt(o);b.hours[new Date(Date.parse(o.closed_at)+JST).getUTCHours()]++}
 const tot=os.length||1;return {days,total:os.length,channels:Object.values(by).map(b=>({...b,share:Math.round(b.n/tot*1000)/10,avg:Math.round(b.sum/(b.n||1)),peak:b.hours.indexOf(Math.max(...b.hours))}))}}
async function recs(){
 const os=await orders(60);const item={},mod={},pair={},nm=x=>x.name+(x.variation_name&&x.variation_name!=='Regular'&&x.variation_name!=='通常'?'':'');
 for(const o of os){const names=[...new Set((o.line_items||[]).map(nm))];
  for(const li of o.line_items||[]){const k=nm(li);const it=item[k]||(item[k]={n:0,mods:{}});it.n+=+li.quantity||1;
   for(const m of li.modifiers||[]){if(/甘さ|甜|%|氷|冰/.test(m.name))continue;it.mods[m.name]=(it.mods[m.name]||0)+1;mod[m.name]=(mod[m.name]||0)+1}}
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const k=[names[i],names[j]].sort().join(' ＋ ');pair[k]=(pair[k]||0)+1}}
 const addon=Object.entries(item).filter(([,v])=>v.n>=10).map(([k,v])=>{const top=Object.entries(v.mods).sort((a,b)=>b[1]-a[1])[0];return top&&{item:k,orders:v.n,addon:top[0],rate:Math.round(top[1]/v.n*100)}}).filter(Boolean).sort((a,b)=>b.rate-a.rate).slice(0,10);
 return {orders:os.length,addon,pairs:Object.entries(pair).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,n])=>({pair:k,n})),topMods:Object.entries(mod).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,n])=>({mod:k,n}))}}
async function lapsed(minDays=30){
 const os=await orders(180).catch(()=>orders(60));const by={};
 for(const o of os){if(!o.customer_id)continue;const c=by[o.customer_id]||(by[o.customer_id]={id:o.customer_id,visits:0,spend:0,last:''});c.visits++;c.spend+=amt(o);if(o.closed_at>c.last)c.last=o.closed_at}
 const list=Object.values(by).map(c=>({...c,daysAgo:Math.floor((Date.now()-Date.parse(c.last))/86400e3)})).filter(c=>c.daysAgo>=minDays&&c.visits>=2).sort((a,b)=>b.spend-a.spend).slice(0,50);
 for(const c of list){try{const j=await sq('/customers/'+c.id);const k=j.customer||{};c.name=[k.family_name,k.given_name].filter(Boolean).join(' ')||k.nickname||'(无名)';c.hasContact=!!(k.email_address||k.phone_number)}catch(e){c.name='?'}}
 return {minDays,members:Object.keys(by).length,list}}
let catC={at:0,v:null};
async function catalog(){if(catC.v&&Date.now()-catC.at<10*60e3)return catC.v;const out=[];let cursor;for(let i=0;i<20;i++){const j=await sq('/catalog/list?types=ITEM'+(cursor?'&cursor='+encodeURIComponent(cursor):''));for(const it of j.objects||[]){if(it.is_deleted)continue;for(const v of (it.item_data.variations||[])){const ov=(v.item_variation_data.location_overrides||[]).find(x=>x.location_id===LOC)||{};out.push({id:v.id,item:it.item_data.name,variation:v.item_variation_data.name,soldOut:!!ov.sold_out})}}cursor=j.cursor;if(!cursor)break}catC={at:Date.now(),v:out};return out}
async function devices(){const j=await sq('/devices');return (j.devices||[]).map(d=>({id:d.id,name:d.attributes&&d.attributes.name,model:d.attributes&&d.attributes.model,status:d.status&&d.status.category}))}
async function terminalCheckout(b){
 const yen=Math.round(+b.amount);if(!(yen>0&&yen<100000))throw Object.assign(new Error('bad amount'),{status:400});
 const body={idempotency_key:crypto.randomUUID(),checkout:{amount_money:{amount:yen,currency:'JPY'},device_options:{device_id:DEVICE,skip_receipt_screen:false},reference_id:String(b.ref||'').slice(0,40),note:String(b.note||'M Stand').slice(0,250),...(b.orderId?{order_id:b.orderId}:{})}};
 if(process.env.SQ_TERMINAL_LIVE!=='1')return {dryRun:true,wouldPost:'/terminals/checkouts',body};
 return sq('/terminals/checkouts',{method:'POST',body:JSON.stringify(body)})}
async function soldOut(b){
 // Square: set location_overrides[].sold_out on the item variation; Uber: queued for uber-sync (no Uber API write here)
 const v=await sq('/catalog/object/'+encodeURIComponent(b.variationId));const o=v.object;if(!o||o.type!=='ITEM_VARIATION')throw Object.assign(new Error('not a variation'),{status:400});
 const ov=(o.item_variation_data.location_overrides||[]).filter(x=>x.location_id!==LOC);ov.push({location_id:LOC,sold_out:!!b.soldOut,track_inventory:true});
 const upd={...o,item_variation_data:{...o.item_variation_data,location_overrides:ov}};
 const plan={square:{wouldPost:'/catalog/object',variation:o.id,name:o.item_variation_data.name,soldOut:!!b.soldOut},uber:{wouldQueue:'uber-sync sold-out toggle',item:b.uberName||null}};
 if(process.env.SOLDOUT_LIVE!=='1')return {dryRun:true,plan};
 await sq('/catalog/object',{method:'POST',body:JSON.stringify({idempotency_key:crypto.randomUUID(),object:upd})});return {dryRun:false,plan}}
const send=(r,c,j)=>{r.writeHead(c,{'content-type':'application/json; charset=utf-8'});r.end(JSON.stringify(j))};
return async function(u,q,r){
 if(String(q.headers['x-pin']||'')!==PIN)return send(r,403,{error:'PIN'});
 let body={};if(q.method==='POST'){let s='';for await(const c of q)s+=c;try{body=JSON.parse(s||'{}')}catch(e){}}
 try{const p=u.pathname.replace('/api/sq/','');
  if(p==='channels')return send(r,200,await channels(+u.searchParams.get('days')||30));
  if(p==='recs')return send(r,200,await recs());
  if(p==='lapsed')return send(r,200,await lapsed(+u.searchParams.get('days')||30));
  if(p==='catalog'){const k=(u.searchParams.get('q')||'').toLowerCase();return send(r,200,(await catalog()).filter(x=>!k||(x.item+' '+x.variation).toLowerCase().includes(k)).slice(0,40))}
  if(p==='devices')return send(r,200,await devices());
  if(p==='terminal-checkout'&&q.method==='POST')return send(r,200,await terminalCheckout(body));
  if(p==='soldout'&&q.method==='POST')return send(r,200,await soldOut(body));
  send(r,404,{error:'nf'})}catch(e){send(r,e.status||500,{error:e.message})}}}
