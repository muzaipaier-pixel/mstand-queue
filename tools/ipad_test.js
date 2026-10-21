const B='http://localhost:8899/api/ipad/',K=require('fs').readFileSync('/workspace/uber-sync/worker.key','utf8').trim();
const call=(p,b,h={'x-pin':'1234'})=>fetch(B+p,{method:b?'POST':'GET',headers:{'content-type':'application/json',...h},body:b&&JSON.stringify(b)}).then(async r=>({s:r.status,j:await r.json()}));
const W={'x-worker-key':K};let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{
 ok((await call('sales',null,{})).s===403,'no PIN -> 403');
 ok((await call('sales',null,{'x-worker-key':K})).s===403,'worker key cannot read sales');
 ok((await call('uber-desired',null,{'x-worker-key':'bad'})).s===403,'bad worker key -> 403');
 let d=(await call('uber-desired',null,W)).j;ok(d.paused===false&&d.mode==='open','default open, not paused');const s0=d.seq;
 await call('screen',{shop:'prep',mins:40});d=(await call('uber-desired',null,W)).j;ok(d.seq===s0+1&&d.paused&&d.until-d.now>39*60e3,'prep -> paused, seq+1, 40min');
 await call('screen',{shop:'prep',mins:40});d=(await call('uber-desired',null,W)).j;ok(d.seq===s0+1,'double tap same mode: no seq bump');
 await call('screen',{shop:'shop',mins:20});d=(await call('uber-desired',null,W)).j;ok(d.seq===s0+2&&d.mode==='shop','prep->shop seq bump');
 await call('screen',{shopAdj:-5});d=(await call('uber-desired',null,W)).j;ok(Math.abs(d.until-d.now-15*60e3)<5e3&&d.seq===s0+2,'-5 min, no seq bump');
 let o=(await call('overview')).j;ok(o.chan.uber.state==='offline','no heartbeat -> offline/unknown shown');
 await call('uber-hb',{observed:'open',dry:true},W);o=(await call('overview')).j;ok(o.chan.uber.state==='pending','heartbeat but not acked -> pending');
 await call('uber-ack',{seq:s0+1,paused:true,ok:true,observed:'paused'},W);o=(await call('overview')).j;ok(o.chan.uber.state==='pending','stale ack (old seq) ignored');
 await call('uber-ack',{seq:s0+2,paused:true,ok:false,msg:'verify failed'},W);o=(await call('overview')).j;ok(o.chan.uber.state==='fail'&&/失败/.test(o.chan.uber.text),'fail shown');
 const c=(await fetch('http://localhost:8899/api/checkout',{method:'POST',body:'{}'})).status;ok(c===409,'QR order blocked while not open');
 // expiry: set until in past via shopAdj can't (min 1 min) -> set 1 min mode and fake by mins tiny not allowed; use closed->open path + check expire after restart separately
 await call('screen',{shop:'closed'});d=(await call('uber-desired',null,W)).j;ok(d.mode==='closed'&&d.until===null&&d.paused,'closed: no countdown, paused');
 await call('screen',{shopAdj:5});d=(await call('uber-desired',null,W)).j;ok(d.until===null,'adj ignored for closed');
 await call('screen',{shop:'open'});d=(await call('uber-desired',null,W)).j;ok(!d.paused&&d.seq===s0+4,'open -> resume, seq bump');
 ok((await fetch('http://localhost:8899/api/checkout',{method:'POST',body:'{}'})).status!==409,'QR order allowed when open');
 ok((await call('soldout',{id:'I2',sold:true})).s===400,'sold out needs confirm');
 let r=(await call('soldout',{id:'I2',sold:true,confirm:true,vars:['nope']})).j;ok(/no variation/.test(r.error||''),'unknown variation rejected');
 r=(await call('soldout',{id:'I2',sold:true,confirm:true,vars:['V2_0']})).j;ok(r.ok&&r.n===1,'single variation sold out');
 r=(await call('restore-all',{confirm:true})).j;ok(r.ok&&r.restored.length>=1,'restore all: '+r.restored.join(','));
 const st=(await fetch('http://localhost:8899/api/state').then(r=>r.json()));ok(!('ipad' in st)&&typeof st.now==='number','public state hides ipad data, has server now');
 console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})();
