// Weekly business report (read-only Square). Uber orders arrive in Square via integration (source name contains "Uber").
// compute(sq, LOC, {start}) -> {range, stats, text}. sq(path,{method,body}) -> json.
const BIZ_H=4,NONCUP=/ギフト|gift|袋|bag|トッピング/i;
const dayStart=d=>Date.parse(d+'T0'+BIZ_H+':00:00+09:00');
const bday=t=>new Date(t+(9-BIZ_H)*3600e3).toISOString().slice(0,10);
const isUber=o=>/uber/i.test((o.source&&o.source.name)||'');
const amt=o=>Number(((o.total_money)||{}).amount||0);
const cupsOf=o=>(o.line_items||[]).reduce((a,l)=>a+(NONCUP.test(l.name||'')?0:(parseInt(l.quantity)||0)),0);
const yen=n=>'¥'+Math.round(n).toLocaleString('en-US');
const WD='日一二三四五六';
function lastWeekStart(now){const d=bday(now||Date.now());const w=new Date(d+'T00:00:00Z').getUTCDay();const m=new Date(Date.parse(d+'T00:00:00Z')-((w+6)%7+7)*864e5);return m.toISOString().slice(0,10)}
function waitMin(o){ // created -> ready (pickup prepared/ready_at) if Square recorded it
 for(const f of o.fulfillments||[]){const p=f.pickup_details||{};const t=p.ready_at||p.prepared_at||(f.state==='PREPARED'||f.state==='COMPLETED'?null:null);if(t){const m=(Date.parse(t)-Date.parse(o.created_at))/6e4;if(m>0&&m<120)return m}}return null}
async function orders(sq,LOC,a,b){let out=[],cur,p=0;
 do{const d=await sq('/orders/search',{method:'POST',body:JSON.stringify({location_ids:[LOC],limit:500,cursor:cur,query:{filter:{date_time_filter:{created_at:{start_at:new Date(a).toISOString(),end_at:new Date(b).toISOString()}},state_filter:{states:['OPEN','COMPLETED']}},sort:{sort_field:'CREATED_AT',sort_order:'ASC'}}})});
  out=out.concat(d.orders||[]);cur=d.cursor;p++}while(cur&&p<60);
 return out.filter(o=>(o.tenders||[]).length>0||isUber(o))}
function stat(os){const items={},hours=new Array(24).fill(0),days={};let w=[];const g={shop:{orders:0,cups:0,rev:0},uber:{orders:0,cups:0,rev:0}};
 for(const o of os){const k=isUber(o)?'uber':'shop',c=cupsOf(o);g[k].orders++;g[k].cups+=c;g[k].rev+=amt(o);
  const t=Date.parse(o.created_at);hours[new Date(t+9*3600e3).getUTCHours()]+=c;const d=bday(t);days[d]=(days[d]||0)+c;
  for(const l of o.line_items||[]){if(NONCUP.test(l.name||''))continue;const n=(l.name||'?').replace(/（.*?）|\(.*?\)/g,'').trim();items[n]=(items[n]||0)+(parseInt(l.quantity)||0)}
  const m=waitMin(o);if(m!=null&&!isUber(o))w.push(m)}
 return {g,items,hours,days,wait:w.length?w.reduce((a,b)=>a+b,0)/w.length:null,waitN:w.length}}
async function compute(sq,LOC,opt={}){const start=opt.start||lastWeekStart(),a=dayStart(start),b=a+7*864e5;
 const end=bday(b-1);const cur=stat(await orders(sq,LOC,a,b));
 const U=opt.uber; // {orders:[{t,cups}], daily:{'YYYY-MM-DD':{rev,orders}}} from Uber cookie tools (Square has no Uber orders)
 if(U){const inW=t=>t>=a&&t<b;const uo=(U.orders||[]).filter(o=>inW(o.t));let rev=0,n=0;for(const d in U.daily||{})if(d>=start&&d<=end){rev+=U.daily[d].rev||0;n+=U.daily[d].orders||0}
  cur.g.uber={orders:n||uo.length,cups:uo.reduce((x,o)=>x+o.cups,0),rev,cupsKnown:uo.length};uo.forEach(o=>{cur.hours[new Date(o.t+9*3600e3).getUTCHours()]+=o.cups;const d=bday(o.t);cur.days[d]=(cur.days[d]||0)+o.cups})}let prev=null;try{prev=stat(await orders(sq,LOC,a-7*864e5,a));if(U){let r=0;const s0=bday(a-7*864e5),e0=bday(a-1);for(const d in U.daily||{})if(d>=s0&&d<=e0)r+=U.daily[d].rev||0;prev.g.uber.rev=r;prev.g.uber.cups=(U.orders||[]).filter(o=>o.t>=a-7*864e5&&o.t<a).reduce((x,o)=>x+o.cups,0)}}catch(e){}
 const T={orders:cur.g.shop.orders+cur.g.uber.orders,cups:cur.g.shop.cups+cur.g.uber.cups,rev:cur.g.shop.rev+cur.g.uber.rev};
 const P=prev?{cups:prev.g.shop.cups+prev.g.uber.cups,rev:prev.g.shop.rev+prev.g.uber.rev}:null;
 const pct=(x,y)=>y?((x-y)/y*100>=0?'+':'')+Math.round((x-y)/y*100)+'%':'—';
 const top=Object.entries(cur.items).sort((x,y)=>y[1]-x[1]).slice(0,8);
 const hrs=cur.hours.map((c,h)=>[h,c]).filter(x=>x[1]).sort((x,y)=>y[1]-x[1]).slice(0,3);
 const ds=Object.entries(cur.days).sort((x,y)=>y[1]-x[1]);const wd=d=>WD[new Date(d+'T00:00:00Z').getUTCDay()];
 const us=T.cups?Math.round(cur.g.uber.cups/T.cups*100):0;
 const L=[`📊 M Stand 池袋 周报（${start.slice(5)} ~ ${end.slice(5)}）`,'',
 `💰 营业额 ${yen(T.rev)}（上周 ${P?yen(P.rev):'—'}，${P?pct(T.rev,P.rev):'—'}）`,
 `🥤 杯数 ${T.cups} 杯 / ${T.orders} 单（上周 ${P?P.cups:'—'} 杯，${P?pct(T.cups,P.cups):'—'}）`,
 `🏪 店里 ${cur.g.shop.cups} 杯 ${yen(cur.g.shop.rev)}　🛵 Uber ${cur.g.uber.cups} 杯 ${yen(cur.g.uber.rev)}（Uber 占杯数 ${us}%）`,
 `🧾 客单价 店里 ${yen(cur.g.shop.rev/Math.max(1,cur.g.shop.orders))}　Uber ${yen(cur.g.uber.rev/Math.max(1,cur.g.uber.orders))}`,'',
 '🏆 热卖 Top '+top.length+'（店里）：',...top.map(([n,c],i)=>`  ${i+1}. ${n} ${c} 杯`),'',
 '⏰ 高峰时段：'+hrs.map(([h,c])=>`${h}:00-${h+1}:00（${c} 杯）`).join('、'),
 ds.length?`📅 最忙 周${wd(ds[0][0])} ${ds[0][1]} 杯，最闲 周${wd(ds[ds.length-1][0])} ${ds[ds.length-1][1]} 杯`:'',
 cur.wait!=null?`⌛ 平均出杯等待 约 ${Math.round(cur.wait)} 分钟（${cur.waitN} 单有记录）`:'⌛ 平均等待：这周的单没有出杯时间记录，暂时算不出'].filter(x=>x!=null);
 return {range:{start,end},stats:{total:T,shop:cur.g.shop,uber:cur.g.uber,top,hours:cur.hours,days:cur.days,wait:cur.wait,waitN:cur.waitN,prev:P},text:L.join('\n'),at:Date.now()}}
module.exports={compute,lastWeekStart};
