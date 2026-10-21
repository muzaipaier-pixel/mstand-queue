// Box-side: follow iPad 店铺状態 -> Uber Eats store Pause orders / resume.
// Acts ONLY when the desired state changes (seq bump) — never re-enforces, so a manual change in Uber Manager is respected.
// On (re)start applies only the LATEST desired state, idempotently (reads Uber status first). Old seqs are never replayed.
// Default DRY (reads status, logs what it would click). Live: --live.
// Auth: header x-worker-key from worker.key (chmod 600) — never logged.
const fs=require('fs');const {chromium}=require('playwright-core');
const URL0=process.env.MSTAND_URL||'https://mstand-queue.onrender.com';
const KEY=(process.env.WORKER_KEY||(()=>{try{return fs.readFileSync(__dirname+'/worker.key','utf8')}catch(e){return ''}})()).trim();
const LIVE=process.argv.includes('--live')||fs.existsSync(__dirname+'/PAUSE_LIVE');
const STORE='b995d00f-e3a8-46de-99f2-72891a95b816',PAGE='https://merchants.ubereats.com/manager/stores/'+STORE;
const LOG=__dirname+'/pause.log',SF=__dirname+'/pause_state.json';
const log=m=>{const l=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Tokyo'})+' JST '+(LIVE?'':'[DRY] ')+m;fs.appendFileSync(LOG,l+'\n');console.log(l)};
let S={done:null,observed:'unknown',obsAt:0};try{S=Object.assign(S,JSON.parse(fs.readFileSync(SF)))}catch(e){}
const saveS=()=>fs.writeFileSync(SF,JSON.stringify(S));
const api=(p,b)=>fetch(URL0+'/api/ipad/'+p,{method:b?'POST':'GET',headers:{'content-type':'application/json','x-worker-key':KEY},body:b&&JSON.stringify(b),signal:AbortSignal.timeout(20000)}).then(r=>{if(!r.ok)throw new Error('server HTTP '+r.status);return r.json()});
let B=null;async function browser(){if(B&&B.isConnected())return B;B=await chromium.connectOverCDP('http://127.0.0.1:9226',{timeout:15000});return B}
// own tab, opened per action and closed after -> never touches the sold-out sync's Menu Maker tab
async function withPage(fn){const b=await browser();const pg=await b.contexts()[0].newPage();try{await pg.goto(PAGE,{waitUntil:'domcontentloaded',timeout:60000});
 if(!/\/manager\/stores\//.test(pg.url()))throw new Error('UBER_LOGIN_EXPIRED');await pg.waitForSelector('text=Store info',{timeout:30000});await waitCtl(pg);return await fn(pg)}finally{await pg.close().catch(()=>{})}}
const CTL='button:has-text("Pause orders"),button:has-text("Resume"),button:has-text("Unpause"),button:has-text("再開")';
async function waitCtl(pg){await pg.waitForSelector(CTL,{timeout:30000}).catch(()=>{});await pg.waitForTimeout(2500)}
async function readStatus(pg){const t=await pg.evaluate(()=>document.body.innerText);const i=t.lastIndexOf('Store info');const seg=t.slice(i,i+400);
 const m=seg.match(/\n\s*(Open|Paused|Closed|Busy|Offline|一時停止中|営業中|休業中)[^\n]*/i);const w=m?m[1].toLowerCase():'';
 const resume=await pg.locator('button:has-text("Resume"),button:has-text("Unpause"),button:has-text("再開")').count();
 const st=resume>0||/paused|一時停止/.test(w)?'paused':/open|営業中/.test(w)?'open':/closed|offline|休業/.test(w)?'closed':'unknown';return {st,raw:(m?m[0]:'').trim().slice(0,60)}}
function plan(d){if(!d.paused)return {dur:null,reason:null};if(d.mode==='closed')return {dur:'Rest of the day',reason:'Closing early'};
 const left=d.until?(d.until-d.now)/60e3:999;return {dur:left<=55?'60 min':'Rest of the day',reason:'Other',text:d.mode==='shop'?'買い出し中':'準備中'}}
async function apply(d){return withPage(async pg=>{const s0=await readStatus(pg);S.observed=s0.st==='closed'?'open':s0.st;S.obsAt=Date.now();
 if(d.paused&&s0.st==='paused')return 'already paused ('+s0.raw+')';
 if(!d.paused&&(s0.st==='open'||s0.st==='closed'))return 'already accepting ('+s0.raw+')';
 if(s0.st==='unknown')throw new Error('status unreadable');
 if(d.paused){const p=plan(d);if(!LIVE)return `would click Pause orders -> "${p.dur}" -> reason "${p.reason}"${p.text?' "'+p.text+'"':''} -> Pause orders (now ${s0.raw})`;
  await pg.locator('button:has-text("Pause orders")').first().click();const dlg=pg.locator('[role=dialog]');await dlg.waitFor({timeout:10000});
  await dlg.locator('button',{hasText:p.dur}).first().click();await dlg.locator('button',{hasText:p.reason}).first().click();
  if(p.text){const inp=dlg.locator('input[type=text]');if(await inp.count())await inp.first().fill(p.text)}
  await dlg.locator('button',{hasText:/^Pause orders$/}).last().click();await pg.waitForTimeout(4000)}
 else{if(!LIVE)return 'would click Resume (now '+s0.raw+')';
  await pg.locator('button:has-text("Resume"),button:has-text("Unpause"),button:has-text("再開")').first().click();await pg.waitForTimeout(1500);
  const dlg=pg.locator('[role=dialog]');if(await dlg.count()){const c=dlg.locator('button',{hasText:/Resume|Confirm|再開|OK/}).last();if(await c.count())await c.click()}await pg.waitForTimeout(4000)}
 await pg.reload({waitUntil:'domcontentloaded'});await pg.waitForSelector('text=Store info',{timeout:30000});await waitCtl(pg);
 const s1=await readStatus(pg);S.observed=s1.st==='closed'?'open':s1.st;S.obsAt=Date.now();
 const ok=d.paused?s1.st==='paused':(s1.st==='open'||s1.st==='closed');if(!ok)throw new Error('verify failed: now '+(s1.raw||s1.st));return (d.paused?'PAUSED':'RESUMED')+' verified ('+s1.raw+')'})}
const BACK=[30,60,120,240,300];let busy=false,lastObs=0;
async function tick(){if(busy)return;busy=true;try{
 const d=await api('uber-desired');
 if(d.seq!==S.done){let n=0,msg,ok=false,want=d;
  while(true){try{msg=await apply(want);ok=true;break}catch(e){msg=e.message;n++;log(`seq ${want.seq} ${want.mode} attempt ${n} FAIL ${msg}`);
    if(/LOGIN_EXPIRED/.test(msg)||n>=BACK.length)break;await api('uber-hb',{observed:S.observed,trying:{n,err:msg.slice(0,60)},dry:!LIVE}).catch(()=>{});
    await new Promise(r=>setTimeout(r,BACK[n-1]*1000));const d2=await api('uber-desired').catch(()=>null);if(d2&&d2.seq!==want.seq){log(`seq ${want.seq} superseded by ${d2.seq}`);want=d2;n=0}}}
  log(`seq ${want.seq} mode=${want.mode} -> ${ok?'OK':'GAVE UP'} ${msg}`);
  await api('uber-ack',{seq:want.seq,paused:want.paused,ok,dry:!LIVE,observed:S.observed,msg:ok?(LIVE?'':msg):msg});
  S.done=want.seq;saveS();lastObs=Date.now()}
 else{if(Date.now()-lastObs>5*60e3){lastObs=Date.now();try{const s=await withPage(readStatus);S.observed=s.st==='closed'?'open':s.st;S.obsAt=Date.now();saveS()}catch(e){S.observed='unknown';log('observe FAIL '+e.message)}}
  await api('uber-hb',{observed:S.observed,dry:!LIVE})}
}catch(e){log('ERR '+e.message)}finally{busy=false}}
if(!KEY){log('no worker key');process.exit(1)}
log('start pid '+process.pid);tick();setInterval(tick,15000);
process.on('SIGTERM',()=>process.exit(0));
