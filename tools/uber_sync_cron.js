// Render Cron: browserless Square -> Uber Eats sold-out sync (port of box uber-sync/sync.js). Same mapping/rules:
// items sold out if all mapped Square variations sold out OR (iPad Uber-hot-off && hot item); hotOptions likewise; toppings from iPad flag.
// Env: UBER_COOKIE, SQUARE_ACCESS_TOKEN, WORKER_KEY, optional APP. Args: --live (default dry run). Exit 3 = Uber login expired.
const fs=require('fs'),path=require('path');const T=__dirname;
const APP=process.env.APP||'https://mstand-queue.onrender.com',LOC='LM4FNJNN3XFAH';
const COOKIE=(process.env.UBER_COOKIE||(process.env.UBER_COOKIE_FILE&&fs.readFileSync(process.env.UBER_COOKIE_FILE,'utf8'))||'').trim();
const KEY=(process.env.WORKER_KEY||'').trim();
const M=JSON.parse(fs.readFileSync(process.env.UBER_MAPPING||path.join(T,'uber_mapping.json')));const STORE=M.storeUUID;
const BASE=JSON.parse(fs.readFileSync(path.join(T,'uber_upsert_base.json')));const WL='8e6e7ed1-ea09-42ca-ad90-4540893eb816';
const MENUS=[{menuType:'MENU_TYPE_FULFILLMENT_DELIVERY',menuUUID:STORE},{menuType:'MENU_TYPE_FULFILLMENT_PICK_UP',menuUUID:STORE}];
const MM3=[{menuType:'MENU_TYPE_FULFILLMENT_DELIVERY',menuUUID:STORE},{menuType:'MENU_TYPE_ORDERCATEGORY_WHITELABEL_ONLINE_ORDERING',menuUUID:WL},{menuType:'MENU_TYPE_FULFILLMENT_PICK_UP',menuUUID:STORE}];
const log=m=>console.log(new Date().toLocaleString('sv-SE',{timeZone:'Asia/Tokyo'})+' JST '+m);
class Expired extends Error{}
async function post(n,b){const r=await fetch('https://merchants.ubereats.com/manager/menumaker/api/'+n+'?localeCode=ja',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(45000),
 headers:{cookie:COOKIE,'content-type':'application/json','x-csrf-token':'x',origin:'https://merchants.ubereats.com','user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'},body:JSON.stringify(b)});
 if(r.status>=300&&r.status<400||r.status===401||r.status===403)throw new Expired('UBER_LOGIN_EXPIRED status='+r.status);
 const j=await r.json().catch(()=>null);if(!j)throw new Error(n+' non-JSON status='+r.status);return j}
async function squareState(){let out=[],cursor;do{const u=new URL('https://connect.squareup.com/v2/catalog/list');u.searchParams.set('types','ITEM');if(cursor)u.searchParams.set('cursor',cursor);
 const r=await fetch(u,{headers:{Authorization:'Bearer '+process.env.SQUARE_ACCESS_TOKEN,'Square-Version':'2024-10-17'},signal:AbortSignal.timeout(30000)});const j=await r.json();if(!r.ok)throw new Error('square '+JSON.stringify(j.errors).slice(0,150));out.push(...(j.objects||[]));cursor=j.cursor}while(cursor);
 const present=o=>o.present_at_all_locations?!(o.absent_at_location_ids||[]).includes(LOC):(o.present_at_location_ids||[]).includes(LOC);
 const so=d=>(d.location_overrides||[]).some(l=>l.location_id===LOC&&l.sold_out);const vs=[];
 for(const o of out){if(o.is_deleted||!present(o))continue;for(const v of o.item_data.variations||[])if(present(v))vs.push({item:o.item_data.name,variation:v.item_variation_data.name,sold_out:so(v.item_variation_data)})}return vs}
async function uberState(){const ids=[...M.items,...M.toppings,...(M.hotOptions||[])].map(x=>x[0]);
 const res=await post('getMenuEntityData',{itemUUIDs:ids,customizationUUIDs:[],menuMapping:MENUS,storeUUID:STORE});
 const items=Object.values(res.data||{})[0];if(!items||!items.itemsMap)throw new Expired('UBER_LOGIN_EXPIRED empty menu data');const out={};
 for(const id of ids){const it=items.itemsMap[id];if(!it){out[id]=null;continue}const d=(it.suspensionInfo&&it.suspensionInfo.defaultValue)||{};
  const until=d.suspendUntilMilliseconds?Date.parse(d.suspendUntilMilliseconds):0;out[id]={uuid:it.uuid,title:it.itemInfo.title.defaultValue,sold_out:until>Date.now()}}
 if(Object.values(out).every(x=>!x))throw new Expired('UBER_LOGIN_EXPIRED no items');return out}
async function suspend(uuid,soldOut){const d=(await post('getMenuEntityData',{itemUUIDs:[uuid],customizationUUIDs:[],menuMapping:MM3,storeUUID:STORE})).data;const changes=[];
 for(const [m,mt] of [[STORE,'MENU_TYPE_FULFILLMENT_DELIVERY'],[WL,'MENU_TYPE_ORDERCATEGORY_WHITELABEL_ONLINE_ORDERING']]){const o=d[m]&&d[m].itemsMap[uuid];if(!o)continue;
  o.suspensionInfo={defaultValue:soldOut?{suspendUntil:'',suspendReason:'',suspendUntilMilliseconds:'2243-10-17T00:00:00.000Z',metadata:null}:{suspendUntil:null,suspendReason:null,suspendUntilMilliseconds:null,metadata:null},overrides:null};
  changes.push({action:'update',menuType:mt,type:'item',data:o})}
 if(!changes.length)throw new Error('entity not found');const r=await post('upsertMenus',Object.assign({},BASE,{changes}));if(r.status!=='success')throw new Error('upsert '+JSON.stringify(r).slice(0,150));return 'changed'}
const srv=async p=>{try{const r=await fetch(APP+'/api/ipad/'+p,{headers:{'x-worker-key':KEY},signal:AbortSignal.timeout(20000)});return r.ok?await r.json():null}catch(e){return null}};
(async()=>{const live=process.argv.includes('--live');if(!COOKIE||!process.env.SQUARE_ACCESS_TOKEN){log('ERROR missing UBER_COOKIE/SQUARE_ACCESS_TOKEN');process.exit(2)}
 const sq=await squareState();const u=await uberState();
 const h=await srv('uber-hot'),hotOff=!!(h&&h.off);const t=await srv('uber-toppings');const tsold=t?new Set((t.sold||[]).map(n=>String(n).split(' / ')[0].trim())):null;
 const isHot=(vars,title)=>{const vh=vars.length&&vars.every(v=>/HOT/i.test(v));const ice=vars.some(v=>/ICED|ICE/i.test(v));return vh||(!ice&&/HOT|热|熱|ホット/i.test(title||''))};
 const changes=[];const sel=(item,vars)=>{const vs=sq.filter(v=>v.item===item&&vars.includes(v.variation));return vs.length===vars.length?vs:null};
 for(const [id,item,vars] of M.items){const vs=sel(item,vars);if(!vs){log('MAPPING WARN '+item);continue}const cur=u[id];const want=vs.every(v=>v.sold_out)||(hotOff&&isHot(vars,cur&&cur.title));if(cur&&cur.sold_out!==want)changes.push({uuid:cur.uuid,title:cur.title,to:want})}
 for(const [id,item,vars] of (M.hotOptions||[])){const vs=sel(item,vars);if(!vs){log('MAPPING WARN hot '+item);continue}const cur=u[id];const want=vs.every(v=>v.sold_out)||hotOff;if(cur&&cur.sold_out!==want)changes.push({uuid:cur.uuid,title:item+' HOT',to:want})}
 if(tsold)for(const [id,name] of M.toppings){const cur=u[id];const want=tsold.has(name);if(cur&&cur.sold_out!==want)changes.push({uuid:cur.uuid,title:cur.title,to:want})}
 log(`${live?'LIVE':'DRY'} checked items=${M.items.length} hot=${(M.hotOptions||[]).length} toppings=${tsold?M.toppings.length:'skip'} hotOff=${hotOff} changes=${changes.length}`);
 let fail=0;for(const c of changes){if(!live){log('WOULD SET ['+c.title.slice(0,40)+'] -> '+(c.to?'SOLD OUT':'available'));continue}
  try{await suspend(c.uuid,c.to);log('SET ['+c.title.slice(0,40)+'] -> '+(c.to?'SOLD OUT':'available'))}catch(e){fail++;log('FAIL '+c.title.slice(0,40)+': '+e.message)}}
 process.exit(fail?4:0)})().catch(e=>{log('ERROR '+e.message);process.exit(e instanceof Expired?3:2)});
