const http=require('http');const now=Date.now();const LOC='LM4FNJNN3XFAH';
const names=['ロイヤルタピオカミルクティー','アボカドスムージー','マンゴーミルク','いちごミルク','ドラゴンミルク','黒糖タピオカミルク','抹茶ミルク','上品四季春','朝露ジャスミン','ハイビスカス'];
const items=names.map((n,i)=>({type:'ITEM',id:'I'+i,version:1,present_at_all_locations:true,item_data:{name:n,categories:[],image_ids:['IMG'+i],variations:['M, ICED','L, ICED','M, HOT','L, HOT'].map((vn,k)=>({id:'V'+i+'_'+k,type:'ITEM_VARIATION',present_at_all_locations:true,item_variation_data:{name:vn,price_money:{amount:600+i*30+k*100,currency:'JPY'},location_overrides:(i===3||(i===1&&k>1))?[{location_id:LOC,sold_out:true}]:[]}}))}}));
const imgs=names.map((n,i)=>({type:'IMAGE',id:'IMG'+i,image_data:{url:'/icon-512.png'}}));
const ord=[];let s=1;const today=new Date(new Date(now+9*3600e3).toISOString().slice(0,10)+'T00:00:00+09:00').getTime();
for(let d=0;d<22;d++)for(let k=0;k<35;k++){const t=today-d*86400e3+(11+k%10)*3600e3+k*60e3;if(d===0&&k>20)continue;const n=names[(k*7+d)%names.length];
 ord.push({id:'X'+(s++),created_at:new Date(t).toISOString(),source:{name:k%9===0?'Uber Eats':'Square Point of Sale'},customer_id:k%5===0?'C1':undefined,line_items:[{name:n,quantity:String(1+k%2),modifiers:k%3?[{name:'タピオカ',quantity:'1'}]:[]}],total_money:{amount:(1+k%2)*680}})}
http.createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const u=new URL(q.url,'http://x');const p=u.pathname.replace('/v2','');let o={};
 if(p==='/orders/search'){const j=JSON.parse(b);const st=j.query.filter.date_time_filter&&j.query.filter.date_time_filter.created_at?Date.parse(j.query.filter.date_time_filter.created_at.start_at):0;const cf=j.query.filter.customer_filter;o={orders:ord.filter(x=>Date.parse(x.created_at)>=st&&(!cf||x.customer_id==='C1'))}}
 else if(p.startsWith('/orders/'))o={order:{id:p.slice(8),customer_id:'C1'}};
 else if(p.startsWith('/customers/'))o={customer:{given_name:'王小美'}};
 else if(p==='/catalog/list')o={objects:[...items,...imgs]};
 else if(p.startsWith('/catalog/object/'))o={object:JSON.parse(JSON.stringify(items.find(x=>x.id===p.slice(16))||null))};
 else if(p==='/catalog/object'&&q.method==='POST'){const j=JSON.parse(b);const i=items.findIndex(x=>x.id===j.object.id);items[i]=j.object;console.log('MOCK UPSERT',j.object.id,JSON.stringify(j.object.item_data.variations.map(v=>[v.item_variation_data.price_money.amount,v.item_variation_data.location_overrides])));o={catalog_object:j.object}}
 else if(p==='/payments')o={payments:[]};
 r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify(o))})}).listen(9911);
