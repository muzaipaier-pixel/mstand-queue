// iPad staff features: sales board, one-tap sold out, stock estimate, peak alert, regulars, call control + announcement.
// All endpoints require the staff PIN (header x-pin or body.pin). Never changes prices.
module.exports=function(ctx){
const {sq,LOC,save,push,PIN,menu,invalidateMenu,TOK}=ctx;
const MONTH_TARGET=parseInt(process.env.MONTH_TARGET||'')||1200000;
// business day: JST, rolls over at 04:00 (shop open past midnight; matches the 4:12 daily summary)
const BIZ_H=parseInt(process.env.BIZ_DAY_START_H||'4');
const tokyoDay=(t)=>new Date((t||Date.now())+(9-BIZ_H)*3600e3).toISOString().slice(0,10);
const dayStart=d=>Date.parse(d+'T'+String(BIZ_H).padStart(2,'0')+':00:00+09:00');
const NONCUP=/ギフト|gift|袋|bag/i;
const cupsOf=o=>((o&&o.line_items)||[]).reduce((a,l)=>a+(NONCUP.test(l.name||'')?0:(parseInt(l.quantity)||0)),0);
const isUber=o=>/uber/i.test((o.source&&o.source.name)||'');
const amt=o=>Number(((o.net_amounts&&o.net_amounts.total_money)||o.total_money||{}).amount||0);
const ST=ctx.st;ST().ipad=ST().ipad||{};const C=ST().ipad;
C.cfg=Object.assign({peak:6},C.cfg||{});
C.stock=C.stock||{day:'',items:[
 {k:'avocado',name:'牛油果 アボカド',unit:'个',start:20,low:4},
 {k:'mango',name:'芒果 マンゴー',unit:'份',start:30,low:6},
 {k:'pearl',name:'珍珠 タピオカ',unit:'份',start:60,low:10},
 {k:'strawberry',name:'草莓 いちご',unit:'份',start:30,low:6},
 {k:'dragon',name:'火龙果 ドラゴン',unit:'份',start:20,low:4},
 {k:'milk',name:'牛奶 ミルク',unit:'杯份',start:80,low:15}]};
C.recipe=C.recipe||[
 {re:'アボカド',use:{avocado:1,milk:1}},{re:'マンゴー',use:{mango:1}},{re:'マンゴーミルク',use:{milk:1}},
 {re:'タピオカ',use:{pearl:1}},{re:'いちご|イチゴ',use:{strawberry:1,milk:1}},{re:'ドラゴン',use:{dragon:1,milk:1}},
 {re:'抹茶ミルク|黒糖|ミルクティー',use:{milk:1}}];
// ---- Square aggregation (read-only) ----
async function ordersSince(startIso,maxPages){let out=[],cur,p=0;
 do{const d=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:500,cursor:cur,query:{filter:{date_time_filter:{created_at:{start_at:startIso}},state_filter:{states:['COMPLETED']}},sort:{sort_field:'CREATED_AT',sort_order:'ASC'}}})});
  out=out.concat(d.orders||[]);cur=d.cursor;p++}while(cur&&p<maxPages);return out.filter(o=>!/giftcard/i.test((o.source&&o.source.name)||''))}
const agg=os=>{const a={cups:0,rev:0,orders:0};os.forEach(o=>{a.cups+=cupsOf(o);a.rev+=amt(o);a.orders++});return a};
let S={at:0,err:null,day:'',today:null,mtd:null,uberSqToday:null,uberSqMtd:null,todayOrders:[],hourly:[]};
async function refresh(){if(!TOK){S.err='no Square token';return}
 try{const day=tokyoDay(),m0=day.slice(0,7)+'-01';
  const all=await ordersSince(new Date(dayStart(m0)).toISOString(),40);
  const t0=dayStart(day);const td=all.filter(o=>Date.parse(o.created_at)>=t0);
  const hourly=new Array(24).fill(0);td.filter(o=>!isUber(o)).forEach(o=>{hourly[new Date(Date.parse(o.created_at)+9*3600e3).getUTCHours()]+=cupsOf(o)});
  S={at:Date.now(),err:null,day,today:agg(td.filter(o=>!isUber(o))),mtd:agg(all.filter(o=>!isUber(o))),uberSqToday:agg(td.filter(isUber)),uberSqMtd:agg(all.filter(isUber)),todayOrders:td,hourly};
 }catch(e){S.err=e.message;console.error('ipad sales',e.message)}}
if(TOK){setTimeout(refresh,8000);setInterval(refresh,3*60e3)}
function uberView(){const u=C.uber||null,day=tokyoDay();
 // pushed values (from box uber-sync / manual) win; else Uber orders seen in Square (if Uber integration posts orders); else unavailable
 const pushedToday=u&&u.day===day&&u.today?u.today:null,pushedMtd=u&&u.month===day.slice(0,7)&&u.mtd?u.mtd:null;
 const sqT=S.uberSqToday&&S.uberSqToday.orders?S.uberSqToday:null,sqM=S.uberSqMtd&&S.uberSqMtd.orders?S.uberSqMtd:null;
 return {today:pushedToday||sqT,mtd:pushedMtd||sqM,src:pushedMtd||pushedToday?'pushed':(sqM?'square':'none'),pushedAt:u&&u.at||null}}
function sales(){const day=tokyoDay(),U=uberView();const shop=S.mtd?S.mtd.rev:0,ub=U.mtd?(U.mtd.rev||0):0;
 const dim=new Date(Date.UTC(+day.slice(0,4),+day.slice(5,7),0)).getUTCDate(),d=+day.slice(8,10);
 const gap=Math.max(0,MONTH_TARGET-shop-ub);
 return {day,at:S.at,err:S.err,today:S.today,mtd:S.mtd,uber:U,target:MONTH_TARGET,total:shop+ub,gap,daysLeft:dim-d+1,perDay:Math.ceil(gap/Math.max(1,dim-d+1)),hourly:S.hourly}}
// ---- stock estimate ----
function stockView(){const day=tokyoDay();const used={};C.stock.items.forEach(i=>used[i.k]=0);
 const rx=C.recipe.map(r=>{try{return {re:new RegExp(r.re,'i'),use:r.use}}catch(e){return null}}).filter(Boolean);
 const since=Math.max(dayStart(day),C.stock.since||0);(S.day===day?S.todayOrders:[]).filter(o=>Date.parse(o.created_at)>=since).forEach(o=>(o.line_items||[]).forEach(l=>{const q=parseInt(l.quantity)||0;if(!q)return;
  const names=[l.name||''].concat((l.modifiers||[]).map(m=>m.name||''));
  names.forEach((n,ix)=>rx.forEach(r=>{if(r.re.test(n))for(const k in r.use)if(k in used)used[k]+=r.use[k]*q*(ix?(parseInt((l.modifiers[ix-1]||{}).quantity)||1):1)}))}));
 for(const k in (C.stock.adj||{}))if(k in used&&C.stock.adjDay===day)used[k]+=C.stock.adj[k];
 return {day,items:C.stock.items.map(i=>{const left=Math.round((i.start-used[i.k])*10)/10;return {...i,lowAt:i.low,used:used[i.k],left,low:left<=i.low}}),recipe:C.recipe,startedDay:C.stock.day,since:Math.max(dayStart(day),C.stock.since||0)}}
// ---- regulars ----
const custC=new Map();
async function customer(orderId){const o=(await sq('/orders/'+encodeURIComponent(orderId))).order||{};const id=o.customer_id;if(!id)return {none:true};
 let c=custC.get(id);if(c&&Date.now()-c.at<10*60e3)return c.v;
 let name='';try{const cu=(await sq('/customers/'+encodeURIComponent(id))).customer||{};name=(cu.nickname||cu.given_name||cu.family_name||'').slice(0,12)}catch(e){}
 let os=[],cur,p=0;do{const d=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:500,cursor:cur,query:{filter:{customer_filter:{customer_ids:[id]},state_filter:{states:['COMPLETED']}}}})});os=os.concat(d.orders||[]);cur=d.cursor;p++}while(cur&&p<4);
 const cnt={};os.forEach(x=>(x.line_items||[]).forEach(l=>{if(NONCUP.test(l.name||''))return;cnt[l.name]=(cnt[l.name]||0)+(parseInt(l.quantity)||1)}));
 const last=os.map(x=>x.created_at).sort().slice(-2)[0];
 const v={name,visits:os.length,top:Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,q])=>({n,q})),last:os.length>1?last:null};
 custC.set(id,{at:Date.now(),v});if(custC.size>300)custC.delete(custC.keys().next().value);return v}
// ---- sold out toggle (Square catalog location_overrides.sold_out, same field uber-sync reads) ----
async function setSoldOut(itemId,sold,varIds){const only=Array.isArray(varIds)&&varIds.length?new Set(varIds.map(String)):null;const o=(await sq('/catalog/object/'+encodeURIComponent(itemId))).object;
 if(!o||o.type!=='ITEM')throw new Error('not item');
 const before=JSON.stringify((o.item_data.variations||[]).map(v=>v.item_variation_data.price_money));
 let touched=0;for(const v of o.item_data.variations||[]){if(only&&!only.has(v.id))continue;touched++;const d=v.item_variation_data;let L=(d.location_overrides||[]).filter(l=>l.location_id!==LOC);
  const mine=(d.location_overrides||[]).find(l=>l.location_id===LOC)||{location_id:LOC};
  if(sold){mine.sold_out=true}else{delete mine.sold_out}
  if(Object.keys(mine).length>1)L.push(mine);d.location_overrides=L}
 if(!touched)throw new Error('no variation');if(JSON.stringify((o.item_data.variations||[]).map(v=>v.item_variation_data.price_money))!==before)throw new Error('price guard');
 await sq('/catalog/object',{method:'POST',body:JSON.stringify({idempotency_key:require('crypto').randomUUID(),object:o})});
 invalidateMenu();return {ok:true,name:o.item_data.name,sold,n:touched}}
// ---- http ----
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});r.end(JSON.stringify(o))};
const body=q=>new Promise(ok=>{let b='';q.on('data',c=>{b+=c;if(b.length>5e4)q.destroy()});q.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch(e){ok({})}})});
// shop status. chanSeq bumps only when the mode changes -> worker acts on changes only (never fights a manual change in Uber Manager)
function setShop(m,mins){m=['open','prep','shop','closed'].includes(m)?m:'open';const cur=ST().shop?ST().shop.mode:'open';
 if(m==='open'){ST().shop=null}
 else{const until=m==='closed'?null:Date.now()+Math.min(180,parseInt(mins)>0?parseInt(mins):40)*60e3;ST().shop={mode:m,until,at:Date.now()}}
 if(m!==cur){C.chanSeq=(C.chanSeq||0)+1;C.chanAt=Date.now()}}
// countdown end -> back to 営業中 server-side (also after restart: state persisted, checked every second); bumps seq so the worker RESUMES Uber
function shopExpire(){const sh=ST().shop;if(sh&&sh.until&&Date.now()>=sh.until){setShop('open');ST().seq++;save();push('screen');return true}return false}
setInterval(shopExpire,1000);
const WKEY=String(process.env.WORKER_KEY||'').trim();
function uberStatus(){const a=C.uberAck,hb=C.uberHb,seq=C.chanSeq||0,now=Date.now();const sh=ST().shop;const want=sh?'paused':'open';
 const stale=!hb||now-hb.at>3*60e3;
 let st,txt;
 if(stale){st='offline';txt='状态未知：同步电脑离线'+(hb?Math.round((now-hb.at)/60e3)+'分钟':'')+'，请手动在 Uber Manager 操作'}
 else if(!seq&&!a){st='ok';txt=hb.observed==='paused'?'已暂停':'接单中'}
 else if(!a||a.seq<seq){st='pending';txt=hb.trying?('切换中…'+(hb.trying.err?'（重试 '+hb.trying.n+'：'+hb.trying.err+'）':'')):'切换中…'}
 else if(!a.ok){st='fail';txt='失败：'+a.msg+' — 请手动在 Uber Manager 操作'}
 else{st=a.dry?'dry':'ok';txt=(a.observed==='paused'?'已暂停':a.observed==='open'?'接单中':(a.paused?'已暂停':'接单中'))+(a.dry?'（演练模式·没有真的改）':'')}
 const obs=hb&&!stale?hb.observed:null;const mismatch=st==='ok'&&obs&&obs!=='unknown'&&obs!==want;
 return {state:st,text:txt+(mismatch?' ｜ 注意：Uber 现在是「'+(obs==='paused'?'暂停':'接单')+'」（可能在 Uber 里手动改过）':''),want,observed:obs,hbAt:hb&&hb.at||null}}
return async function api(u,q,r){const j=q.method==='POST'?await body(q):{};
 const p=u.pathname.slice('/api/ipad/'.length);const pin=String(q.headers['x-pin']||j.pin||'');
 const wk=String(q.headers['x-worker-key']||'');const isW=/^uber-(desired|ack|hb)$/.test(p)&&WKEY&&wk.length===WKEY.length&&require('crypto').timingSafeEqual(Buffer.from(wk),Buffer.from(WKEY));
 if(!isW&&(!PIN||pin!==PIN))return send(r,403,{error:'PIN'});
 try{
 if(p==='sales'){if(u.searchParams.get('refresh')==='1'||Date.now()-S.at>3*60e3)await refresh();return send(r,200,sales())}
 if(p==='uber'&&q.method==='POST'){const day=tokyoDay();const n=x=>x&&{rev:Math.max(0,parseInt(x.rev)||0),orders:Math.max(0,parseInt(x.orders)||0),cups:Math.max(0,parseInt(x.cups)||0)};
  C.uber={day,month:day.slice(0,7),today:n(j.today)||(C.uber&&C.uber.day===day?C.uber.today:null),mtd:n(j.mtd)||(C.uber&&C.uber.month===day.slice(0,7)?C.uber.mtd:null),at:Date.now()};save();return send(r,200,sales())}
 if(p==='menu'){const m=await menu();return send(r,200,m.map(i=>({id:i.id,name:i.name,cat:i.cat,img:i.img,so:i.so,vars:i.vars.map(v=>({id:v.id,name:v.name,so:v.so}))})))}
 if(p==='soldout'&&q.method==='POST'){if(j.confirm!==true)return send(r,400,{error:'confirm required'});return send(r,200,await setSoldOut(String(j.id||''),!!j.sold,j.vars))}
 if(p==='restore-all'&&q.method==='POST'){if(j.confirm!==true)return send(r,400,{error:'confirm required'});const m=await menu();const out=[];for(const i of m.filter(i=>i.vars.some(v=>v.so))){try{await setSoldOut(i.id,false);out.push(i.name)}catch(e){out.push(i.name+' ✗'+e.message)}}return send(r,200,{ok:true,restored:out})}
 if(p==='stock'){if(q.method==='POST'){
   if(j.items)C.stock.items=j.items.slice(0,30).map(i=>({k:String(i.k).replace(/\W/g,'').slice(0,20),name:String(i.name||i.k).slice(0,30),unit:String(i.unit||'').slice(0,6),start:+i.start||0,low:+i.low||0}));
   if(j.recipe)C.recipe=j.recipe.slice(0,60).map(x=>({re:String(x.re).slice(0,60),use:Object.fromEntries(Object.entries(x.use||{}).map(([k,v])=>[k,+v||0]))}));
   if(j.restock){C.stock.day=tokyoDay();C.stock.since=Date.now();C.stock.adj={};C.stock.adjDay=tokyoDay()}
   if(j.adj){if(C.stock.adjDay!==tokyoDay()){C.stock.adj={};C.stock.adjDay=tokyoDay()}for(const k in j.adj)C.stock.adj[k]=(C.stock.adj[k]||0)+(+j.adj[k]||0)}
   save()}return send(r,200,stockView())}
 if(p==='cfg'&&q.method==='POST'){if(j.peak)C.cfg.peak=Math.max(1,Math.min(50,parseInt(j.peak)||6));save();return send(r,200,C.cfg)}
 if(p==='overview'){const prep=ST().preparing||[];return send(r,200,{now:Date.now(),cfg:C.cfg,open:prep.length,peak:prep.length>=C.cfg.peak,stockLow:stockView().items.filter(i=>i.low).map(i=>i.name),screen:{vol:ST().screenVol==null?1:ST().screenVol,ann:ST().ann||null,shop:ST().shop||null},chan:{seq:C.chanSeq||0,uber:uberStatus(),orderGate:process.env.SHOP_GATE_ORDER!=='0'},closedStale:!!(ST().shop&&ST().shop.mode==='closed'&&tokyoDay(ST().shop.at)!==tokyoDay()&&new Date(Date.now()+9*3600e3).getUTCHours()>=10)})}
 // box-side worker (uber-sync on the shop PC) polls desired Uber state and acks; Render cannot drive a browser
 if(p==='uber-desired'){shopExpire();const sh=ST().shop;return send(r,200,{seq:C.chanSeq||0,paused:!!(sh&&sh.mode),mode:sh?sh.mode:'open',until:sh&&sh.until||null,now:Date.now()})}
 if(p==='uber-ack'&&q.method==='POST'){const sq_=parseInt(j.seq)||0;if(sq_<(C.chanSeq||0)&&sq_!==-1)return send(r,200,{ok:true,stale:true}); // ignore acks for superseded seqs
  C.uberAck={seq:sq_,paused:!!j.paused,ok:!!j.ok,dry:!!j.dry,observed:['open','paused','unknown'].includes(j.observed)?j.observed:'unknown',msg:String(j.msg||'').slice(0,120),at:Date.now()};C.uberHb=Object.assign(C.uberHb||{},{at:Date.now(),observed:C.uberAck.observed,trying:null});save();return send(r,200,{ok:true})}
 if(p==='uber-hb'&&q.method==='POST'){C.uberHb={at:Date.now(),observed:['open','paused','unknown'].includes(j.observed)?j.observed:(C.uberHb&&C.uberHb.observed)||'unknown',trying:j.trying?{n:parseInt(j.trying.n)||0,err:String(j.trying.err||'').slice(0,80)}:null,dry:!!j.dry};return send(r,200,{ok:true,seq:C.chanSeq||0})}
 if(p==='customer'){return send(r,200,await customer(u.searchParams.get('order')||''))}
 if(p==='screen'&&q.method==='POST'){
   if(j.vol!=null)ST().screenVol=Math.max(0,Math.min(1,+j.vol));
   if(j.ann!=null){const t=String(j.ann).replace(/[\u200d\ufe0f<>]/g,'').slice(0,60);ST().ann=t?{text:t,until:Date.now()+Math.max(1,Math.min(720,parseInt(j.mins)||60))*60e3}:null}
   if(j.shop!=null)setShop(j.shop,j.mins)
   if(j.shopAdj&&ST().shop&&ST().shop.until){const sh=ST().shop;sh.until=Math.max(Date.now()+60e3,Math.min(Date.now()+180*60e3,sh.until+(parseInt(j.shopAdj)||0)*60e3))}
   ST().seq++;save();push('screen');return send(r,200,{vol:ST().screenVol,ann:ST().ann,shop:ST().shop||null})}
 return send(r,404,{error:'nf'})
 }catch(e){console.error('ipad',p,e.message);return send(r,502,{error:e.message})}}
};
