/* critter chat + order thanks + pickup bye (ES5). Priority: call > thanks > bye > chat. Pre-cached static clips. */
(function(){
var NM=null,Q=[],cur=null,lastThx=0,lastBye=0,lastChat=new Date().getTime(),nextChat=rnd(150,240)*1000,ci=0,byeT=null,LINES=null;
var CH=['c1','c2','c3','c4','c5','c6','c7','c8'];
function rnd(a,b){return a+Math.random()*(b-a)}
function now(){return new Date().getTime()}
function g(i){return document.getElementById(i)}
var au=document.createElement('audio');au.id='nv';au.preload='auto';document.body.appendChild(au);
var bub=document.createElement('div');bub.id='nbub';bub.style.cssText='position:fixed;z-index:8500;display:none;max-width:30vw;background:#fff;border:.25vw solid #ff9cc0;border-radius:1.6vw;padding:.6vw 1vw;font:800 1.5vw/1.35 -apple-system,"Hiragino Sans","PingFang SC",sans-serif;color:#5a2a1a;box-shadow:0 .4vw 1.2vw rgba(0,0,0,.2);pointer-events:none';document.body.appendChild(bub);
function x(u,cb){try{var r=new XMLHttpRequest();r.open('GET',u,true);r.onreadystatechange=function(){if(r.readyState===4&&r.status===200&&cb)cb(r.responseText)};r.send(null)}catch(e){}}
function url(id,l){return '/voice/notice/'+NM[id][l].f+'?v='+NM.v}
x('/voice/notice/manifest.json?v=1',function(t){try{NM=JSON.parse(t);var k,l;for(k in NM)if(k!=='v')for(l in NM[k])x(url(k,l))}catch(e){}});
x('/notice_lines.json?v=1',function(t){try{LINES=JSON.parse(t)}catch(e){}});
function busyHi(){if(document.body.className.indexOf('calling')>=0)return true;var ids=['vo','chime'],i,a;for(i=0;i<ids.length;i++){a=g(ids[i]);if(a&&!a.paused&&!a.ended&&a.volume>0)return true}return false}
function hushCritter(){try{var c=g('caud');if(c&&!c.paused)c.pause()}catch(e){}}
function busy(){if(document.body.className.indexOf('calling')>=0)return true;var ids=['vo','chime','caud'],i,a;for(i=0;i<ids.length;i++){a=g(ids[i]);if(a&&!a.paused&&!a.ended&&a.volume>0)return true}var cb=g('cbub');if(cb&&cb.style.opacity!=='0'&&cb.style.opacity!=='')return true;return false}
function vol(base){var v=typeof window.SVOL==='number'?window.SVOL:1;return Math.max(0,Math.min(1,base*v))}
function stop(){try{au.pause()}catch(e){}bub.style.display='none';cur=null;Q=[];window.__nvBusy=false}
window.noticeStop=stop;window.noticeStopChat=function(){if(cur&&cur.kind==='chat')stop()};
function place(who){var el=who===1?document.querySelector('.crf'):g('critter');if(!el)el=g('critter');var r=el?el.getBoundingClientRect():null;
 if(!r||!r.width){bub.style.left='60vw';bub.style.top='70vh';return}var L=Math.max(8,Math.min(window.innerWidth-bub.offsetWidth-8,r.left+r.width/2-bub.offsetWidth/2));bub.style.left=L+'px';bub.style.top=Math.max(8,r.top-bub.offsetHeight-10)+'px'}
function play(step){if(!NM||!NM[step.id])return next();if(window.SOUND===false||(step.kind==='chat'&&(window.CRIT_VOICE===false||window.CRIT_SHOW===false))){return next()}
 cur=step;window.__nvBusy=true;if(step.say){bub.innerHTML=step.say;bub.style.display='block';place(step.who)}else bub.style.display='none';
 var done=false,fin=function(){if(done)return;done=true;setTimeout(next,step.gap||400)};
 try{au.onended=fin;au.onerror=fin;au.src=url(step.id,step.l);au.volume=vol(step.v||0.5);if(au.load)au.load();var p=au.play();if(p&&p['catch'])p['catch'](fin)}catch(e){fin()}
 setTimeout(fin,(NM[step.id][step.l].d+1.5)*1000)}
function next(){bub.style.display='none';cur=null;window.__nvBusy=false;if(!Q.length)return;var hi=Q[0].kind!=='chat';if(busyHi()||(!hi&&!Q[0].cont&&busy())){Q=[];return}if(hi)hushCritter();play(Q.shift())}
function esc(s){return String(s).replace(/</g,'&lt;')}
function enqueue(kind,steps){if(cur&&cur.kind==='chat'&&kind!=='chat'){stop()}if(cur)return false;for(var i=0;i<steps.length;i++)steps[i].kind=kind;Q=steps;next();return true}
// 1) new paid order -> thanks (debounced 25s; bursts collapse into one)
window.noticeThanks=function(){var t=now();if(t-lastThx<25000)return;lastThx=t;var tries=0;(function go(){if(busyHi()&&tries++<6){setTimeout(go,2500);return}
 enqueue('thx',[{id:'thx',l:'zh',v:0.75,gap:250},{id:'thx',l:'ja',v:0.75}])})()};
// 2) pickup -> bye: 75s after a call (customer has had time to collect), cancelled by the next call; max once per 2 min
window.noticeCalled=function(){stop();if(byeT)clearTimeout(byeT);byeT=setTimeout(function(){byeT=null;if(now()-lastBye<120000||busyHi())return;lastBye=now();enqueue('bye',[{id:'bye',l:'zh',v:0.6,gap:250},{id:'bye',l:'ja',v:0.6}])},75000)};
// 3) idle critter chat: two-critter dialogue (main says zh, friend answers ja), every ~4-7 min, low volume
setInterval(function(){if(!NM||!LINES)return;var t=now();if(t-lastChat<nextChat)return;if(busy()||cur||t-lastThx<60000)return;
 lastChat=t;nextChat=rnd(240,420)*1000;var id=CH[ci++%CH.length];
 enqueue('chat',[{id:id,l:'zh',v:0.4,who:0,say:esc(LINES[id].zh),gap:600},{id:id,l:'ja',v:0.4,who:1,cont:1,say:esc(LINES[id].ja)}])},1000);
window.noticeDebug=function(k){if(k==='chat'){lastChat=0;nextChat=0}else if(k==='thx'){lastThx=0;window.noticeThanks()}else if(k==='bye'){lastBye=0;enqueue('bye',[{id:'bye',l:'zh',v:0.6},{id:'bye',l:'ja',v:0.6}])}};
})();
