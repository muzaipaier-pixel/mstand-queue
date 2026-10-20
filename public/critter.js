/* Daily cute cartoon animal (inline SVG) running around the screen edge. ES5, no SMIL/filters. */
(function(){try{
var NS='http://www.w3.org/2000/svg';
/* All animals drawn in a 64x64 box facing LEFT, ground at y=61. */
function eyes(x1,x2,y){return E(x1,y)+E(x2,y)}
function E(x,y){return '<ellipse cx="'+x+'" cy="'+y+'" rx="3.3" ry="4" fill="#3a2a2a"/><circle cx="'+(x-1.1)+'" cy="'+(y-1.5)+'" r="1.5" fill="#fff"/><circle cx="'+(x+1.2)+'" cy="'+(y+1.4)+'" r=".7" fill="#fff"/>'}
function blush(x1,x2,y){return '<ellipse cx="'+x1+'" cy="'+y+'" rx="3" ry="1.8" fill="#ff8fa3" opacity=".75"/><ellipse cx="'+x2+'" cy="'+y+'" rx="3" ry="1.8" fill="#ff8fa3" opacity=".75"/>'}
function smile(x,y){return '<path d="M'+(x-2.4)+' '+y+'q1.2 1.8 2.4 0q1.2 1.8 2.4 0" fill="none" stroke="#3a2a2a" stroke-width="1.1" stroke-linecap="round"/>'}
function leg(id,x,c,o){return '<g id="'+id+'"><rect x="'+(x-3.2)+'" y="45" width="6.4" height="16" rx="3.2" fill="'+c+'" stroke="'+o+'" stroke-width="1"/></g>'}
function face(hx,hy){return eyes(hx-6,hx+5,hy+1)+blush(hx-10,hx+9,hy+6)+smile(hx-.5,hy+5)}
function quad(o){ /* o: body,dark,line,ears(svg),tail(svg),extra(svg),belly,legc */
 var b=o.body,l=o.line,lc=o.legc||b,dk=o.dark;
 return '<g id="ct">'+o.tail+'</g>'+leg('l1',29,dk,l)+leg('l3',47,dk,l)+
 '<ellipse cx="39" cy="44" rx="17" ry="12" fill="'+b+'" stroke="'+l+'" stroke-width="1.3"/>'+
 (o.belly?'<ellipse cx="38" cy="49" rx="10" ry="5.5" fill="'+o.belly+'"/>':'')+
 leg('l0',33,lc,l)+leg('l2',51,lc,l)+
 '<g id="ce">'+o.ears+'</g><circle cx="22" cy="29" r="16" fill="'+b+'" stroke="'+l+'" stroke-width="1.3"/>'+(o.mask||'')+face(22,29)+(o.extra||'')}
var C={
cat:function(h){var b='#ffb766',l='#b86b1f';return quad({body:b,dark:'#e8994a',line:l,belly:'#fff1dd',
 ears:'<path d="M8 22L9 6 20 15Z M24 14L35 7 35 23Z" fill="'+b+'" stroke="'+l+'" stroke-width="1.3" stroke-linejoin="round"/><path d="M11 17L11.5 10 17 15Z M27 15L33 11 33 19Z" fill="#ffb3c1"/>',
 tail:'<path d="M54 42q10 -4 7 -16" fill="none" stroke="'+l+'" stroke-width="6.5" stroke-linecap="round"/><path d="M54 42q10 -4 7 -16" fill="none" stroke="'+b+'" stroke-width="4.5" stroke-linecap="round"/>',
 mask:'<path d="M18 14q4 3 8 0" fill="none" stroke="#e8994a" stroke-width="1.6" stroke-linecap="round"/>',
 extra:h?'<g transform="rotate(-14 22 12)"><ellipse cx="22" cy="14" rx="15" ry="3" fill="#5b2d8a"/><path d="M13 14L24 -6 31 14Z" fill="#6c35a3" stroke="#3e1a63" stroke-width="1" stroke-linejoin="round"/><rect x="15" y="10" width="15" height="3" fill="#ff9a1f"/><circle cx="24" cy="-6" r="2" fill="#ffd23f"/></g>':''})},
dog:function(){var b='#f5e1c4',l='#a6794a';return quad({body:b,dark:'#e3c9a3',line:l,belly:'#fffaf2',
 ears:'',tail:'<path d="M54 40q9 -2 9 -11" fill="none" stroke="'+l+'" stroke-width="6.5" stroke-linecap="round"/><path d="M54 40q9 -2 9 -11" fill="none" stroke="'+b+'" stroke-width="4.5" stroke-linecap="round"/>',
 mask:'<ellipse cx="29" cy="24" rx="5" ry="5" fill="#d9a46b" opacity=".7"/><ellipse cx="20" cy="34" rx="3" ry="2" fill="#3a2a2a"/>',
 extra:'<g id="ce2"><ellipse cx="9" cy="24" rx="5" ry="9" fill="#c98c55" stroke="'+l+'" stroke-width="1.2" transform="rotate(20 9 24)"/><ellipse cx="35" cy="24" rx="5" ry="9" fill="#c98c55" stroke="'+l+'" stroke-width="1.2" transform="rotate(-20 35 24)"/></g>'})},
rabbit:function(){var b='#ffffff',l='#b9a3b0';return quad({body:b,dark:'#efe4ea',line:l,belly:'#fff5f8',
 ears:'<ellipse cx="15" cy="7" rx="4.5" ry="12" fill="'+b+'" stroke="'+l+'" stroke-width="1.3" transform="rotate(-12 15 15)"/><ellipse cx="15" cy="7" rx="2.2" ry="8.5" fill="#ffc2d1" transform="rotate(-12 15 15)"/><ellipse cx="27" cy="7" rx="4.5" ry="12" fill="'+b+'" stroke="'+l+'" stroke-width="1.3" transform="rotate(14 27 15)"/><ellipse cx="27" cy="7" rx="2.2" ry="8.5" fill="#ffc2d1" transform="rotate(14 27 15)"/>',
 tail:'<circle cx="56" cy="40" r="5" fill="#fff" stroke="'+l+'" stroke-width="1.2"/>',
 mask:'<ellipse cx="21.5" cy="33" rx="1.6" ry="1.1" fill="#ff7d9a"/>'})},
hamster:function(){var b='#f7c58b',l='#b97a3a';return quad({body:b,dark:'#e8ad6c',line:l,belly:'#fff7ea',
 ears:'<circle cx="11" cy="16" r="5" fill="'+b+'" stroke="'+l+'" stroke-width="1.3"/><circle cx="11" cy="16" r="2.6" fill="#ffb3c1"/><circle cx="33" cy="16" r="5" fill="'+b+'" stroke="'+l+'" stroke-width="1.3"/><circle cx="33" cy="16" r="2.6" fill="#ffb3c1"/>',
 tail:'<circle cx="56" cy="44" r="2.5" fill="'+b+'" stroke="'+l+'"/>',
 mask:'<ellipse cx="22" cy="37" rx="11" ry="6" fill="#fff7ea"/><ellipse cx="21.5" cy="33" rx="1.5" ry="1" fill="#ff7d9a"/>'})},
panda:function(){var b='#ffffff',l='#555',k='#2f2f37';return quad({body:b,dark:k,line:l,legc:k,
 ears:'<circle cx="10" cy="16" r="5.5" fill="'+k+'"/><circle cx="34" cy="16" r="5.5" fill="'+k+'"/>',
 tail:'<circle cx="56" cy="40" r="3.5" fill="'+k+'"/>',
 mask:'<ellipse cx="16" cy="30" rx="5.2" ry="6" fill="'+k+'" transform="rotate(20 16 30)"/><ellipse cx="27" cy="30" rx="5.2" ry="6" fill="'+k+'" transform="rotate(-20 27 30)"/><ellipse cx="21.5" cy="34" rx="2" ry="1.3" fill="'+k+'"/>'})
 .replace('<ellipse cx="39" cy="44" rx="17" ry="12" fill="#ffffff"','<path d="M30 34h8v22h-8z" fill="'+k+'"/><ellipse cx="39" cy="44" rx="17" ry="12" fill="#ffffff"')},
chick:function(){var b='#ffe066',l='#d9a400',o='#ff9f1c';
 return '<g id="l1"><path d="M30 50v10m-3 1h6" stroke="#e8860f" stroke-width="2.4" stroke-linecap="round"/></g>'+
 '<g id="ce"><path d="M30 18q-2 -8 3 -10q-1 5 1 9z" fill="'+b+'" stroke="'+l+'" stroke-width="1"/></g>'+
 '<ellipse cx="33" cy="38" rx="20" ry="18" fill="'+b+'" stroke="'+l+'" stroke-width="1.3"/>'+
 '<g id="l0"><path d="M38 52v9m-3 1h6" stroke="'+o+'" stroke-width="2.4" stroke-linecap="round"/></g>'+
 '<g id="ct"><ellipse cx="42" cy="40" rx="8" ry="5.5" fill="#ffd23f" stroke="'+l+'" stroke-width="1.1" transform="rotate(-20 42 40)"/></g>'+
 '<path d="M14 33l-6 2.5 6 2.5z" fill="'+o+'" stroke="#d97706" stroke-width=".8" stroke-linejoin="round"/>'+
 eyes(19,30,30)+blush(16,34,36)},
bat:function(){var b='#6b4f9e',l='#3d2766',w='#8a6cc4';
 return '<g id="l0"><path d="M24 34Q12 22 2 26q4 4 2 8q5 -1 6 4q4 -3 8 1z" fill="'+w+'" stroke="'+l+'" stroke-width="1.2" stroke-linejoin="round"/></g>'+
 '<g id="l1"><path d="M40 34Q52 22 62 26q-4 4 -2 8q-5 -1 -6 4q-4 -3 -8 1z" fill="'+w+'" stroke="'+l+'" stroke-width="1.2" stroke-linejoin="round"/></g>'+
 '<path d="M21 26L20 10 29 20Z M43 26L44 10 35 20Z" fill="'+b+'" stroke="'+l+'" stroke-width="1.2" stroke-linejoin="round"/>'+
 '<circle cx="32" cy="33" r="15" fill="'+b+'" stroke="'+l+'" stroke-width="1.3"/><ellipse cx="32" cy="40" rx="9" ry="6" fill="#9b82cf"/>'+
 eyes(26,38,31)+blush(22,42,37)+smile(32,37)+'<path d="M29.5 38.5l1 2 1-2M32.5 38.5l1 2 1-2" fill="#fff"/>'}};
var A=['cat','dog','rabbit','hamster','panda','chick'];
var d=new Date(),M=d.getMonth()+1,D=d.getDate(),doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);
var qs=location.search,m=/[?&]critter=(\w+)/.exec(qs);
var k=A[doy%A.length],hw=false;
if(M===10&&D>=20){k=(doy%2)?'cat':'bat';hw=true}
if(m){if(C[m[1]]){k=m[1];hw=/[?&]hw=1/.test(qs)}else k=A[(+m[1]||0)%A.length]}
function svg(key,h){return '<svg xmlns="'+NS+'" width="64" height="64" viewBox="-2 -8 68 70" overflow="visible">'+C[key](h)+'</svg>'}
var HIP={l0:[33,47],l1:[29,47],l2:[51,47],l3:[47,47],ct:[54,42],ce:[22,20]};
if(k==='chick')HIP={l0:[38,52],l1:[30,50],ct:[38,40],ce:[31,18]};
if(k==='bat')HIP={l0:[24,34],l1:[40,34]};
/* pose: phase f in [0,1) of the run cycle; sets transform attributes */
function pose(root,key,f,stop){var s=Math.sin(2*Math.PI*f),c=Math.cos(2*Math.PI*f),a,n,el,h;
 var g={l0:28*s,l1:-28*s,l2:-28*s,l3:28*s,ct:12*c,ce:3*s};
 if(key==='chick'){g={l0:30*s,l1:-30*s,ct:-25*Math.abs(s),ce:6*c}}
 if(key==='bat'){var fl=Math.sin(4*Math.PI*f);g={l0:-35*fl,l1:35*fl}}
 if(stop){for(n in g)g[n]=n==='ct'?g[n]:0}
 for(n in g){el=root.querySelector('#'+n);h=HIP[n];if(el&&h)el.setAttribute('transform','rotate('+g[n].toFixed(1)+' '+h[0]+' '+h[1]+')')}}
window.MSCritter={svg:svg,keys:A.concat(['bat']),pose:function(r,key,f){var o=HIP;HIP=key==='chick'?{l0:[38,52],l1:[30,50],ct:[38,40],ce:[31,18]}:key==='bat'?{l0:[24,34],l1:[40,34]}:{l0:[33,47],l1:[29,47],l2:[51,47],l3:[47,47],ct:[54,42],ce:[22,20]};pose(r,key,f);HIP=o}};

/* ---- product intro: walk to a menu card and say something ---- */
var PI=[
[/^ロイヤルタピオカミルクティー/,'至尊珍奶','人气No.1，珍珠Q弹～'],
[/アボカドスムージー/,'整颗牛油果','牛油果每天现开的哦～'],
[/^上品四季春/,'四季春茶','清香回甘，超解腻～'],
[/朝露ジャスミン/,'茉莉花茶','一口满满茉莉花香～'],
[/ハイビスカス/,'扶桑花茶','酸酸甜甜，颜色超美～'],
[/トウガン/,'冬瓜茶','古早味冬瓜茶，消暑～'],
[/マンゴーミルク/,'芒果多多','满满芒果果肉哦～'],
[/ドラゴンミルク/,'火龙果多多','粉粉的火龙果超好拍～'],
[/いちごミルク|イチゴミルク/,'草莓多多','草莓配鲜奶，甜甜的～'],
[/黒糖/,'黑糖波波','黑糖珍珠，浓浓焦香～'],
[/抹茶ミルク/,'抹茶牛奶','Q弹球配抹茶，好好嚼～'],
[/Mixベリーミルク|ミックスベリーミルク/,'莓莓多多','好几种莓果一起喝～'],
[/チーズクリーム四季春/,'芝士四季春','咸香奶盖配清茶～'],
[/チーズクリームジャスミン/,'芝士茉莉','奶盖绵绵配茉莉～'],
[/チーズクリーム宇治抹茶/,'芝士抹茶','宇治抹茶+奶盖，绝配～'],
[/ココナッツ/,'椰子牛奶冰','椰香满满，冰冰凉凉～'],
[/満杯ドラゴンフルーツ/,'满杯火龙果','满满一杯火龙果～'],
[/満杯いちごスムージー|イチゴゴゴ/,'芝芝莓莓','满杯草莓，酸甜刚好～'],
[/チェリー/,'满杯车厘子','车厘子控必点哦～'],
[/ヤンジー|楊枝甘露|杨枝甘露/,'杨枝甘露','芒果西柚，港式经典～'],
[/Mixベリースムージー/,'综合莓果冰沙','新品！莓果冰沙～'],
[/ブルーベリー/,'蓝莓冰沙','新品！蓝莓酸酸甜甜～'],
[/パイナップル/,'海盐菠萝冰沙','新品！海盐配菠萝～'],
[/パッション/,'满杯百香果','百香果香到冒泡～'],
[/タロ芋/,'芋头牛奶冰沙','芋泥控快来～'],
[/爆ライム/,'爆青柠四季春','超清爽，夏天必喝～'],
[/柚子|ゆず/,'满杯蜂蜜柚橙','柚子蜂蜜，暖暖的～']];
var GEN='这杯也超好喝哦～';
function cards(){var R=[],i,j,mp=window.SOMAP,m=document.getElementById('menu');if(!mp||!m)return R;
 var mr=m.getBoundingClientRect();if(mr.width<50)return R;
 var so=[],sk=document.getElementById('somask'),ds=sk?sk.getElementsByTagName('div'):[];
 for(i=0;i<ds.length;i++)if(/(^| )so( |$)/.test(ds[i].className)&&!/tp/.test(ds[i].className))so.push(ds[i].style.left+'|'+ds[i].style.top);
 for(j=0;j<mp.length;j++){var b=mp[j];if(so.indexOf(b.x+'%|'+b.y+'%')>=0)continue;
  var t=null;for(i=0;i<PI.length;i++)if(PI[i][0].source===b.re.source){t=PI[i];break}
  if(!t)for(i=0;i<PI.length;i++)if(b.re.test(PI[i][1])){t=PI[i];break}
  R.push({x:mr.left+mr.width*b.x/100,y:mr.top+mr.height*b.y/100,w:mr.width*b.w/100,h:mr.height*b.h/100,n:t?t[1]:'',s:t?t[2]:GEN,mw:mr.width})}
 return R}
window.MSCritterCards=cards;
if(/[?&]critter=off/.test(qs))return;
var st=document.createElement('style');
st.textContent='#critter{position:fixed;left:0;top:0;z-index:9000;pointer-events:none;will-change:transform;-webkit-transform:translate3d(-99px,0,0);transform:translate3d(-99px,0,0)}'+
'#cbub{position:fixed;z-index:9001;pointer-events:none;background:#fff;color:#5b2a86;border:4px solid #ff6fae;border-radius:999px;padding:.12em .55em;font-family:sans-serif;font-weight:700;line-height:1.25;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.35);opacity:0;-webkit-transition:opacity .3s;transition:opacity .3s}#cbub b{color:#ff3d8b;margin-right:.3em}#cbub:after{content:"";position:absolute;left:28px;border:10px solid transparent}#cbub.up:after{top:100%;border-top-color:#ff6fae}#cbub.dn:after{bottom:100%;border-bottom-color:#ff6fae}'+
'#critter i{display:block;width:64px;height:64px;-webkit-transform-origin:50% 95%;transform-origin:50% 95%;will-change:transform}#critter svg{display:block;overflow:visible}';
document.getElementsByTagName('head')[0].appendChild(st);
var w=document.createElement('div');w.id='critter';w.innerHTML='<i>'+svg(k,hw)+'</i>';
function start(){document.body.appendChild(w);var ie=w.firstChild,sv=ie.firstChild;
var S=64,fz=/[?&]critterpos=([\d.]+)/.exec(location.search),seg=0,sp=0,pause=0,last=0,ph=0,
mode=0,tg=null,ox=0,oy=0,cx=0,cy=0,bx=0,by0=0,stay=0,nextI=(/[?&]critterintro=1/.test(location.search)?1.5:25+Math.random()*15),ci=Math.floor(Math.random()*99),bub=document.createElement('div'),
raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){return setTimeout(function(){f(+new Date())},33)};
function tick(t){try{var W=window.innerWidth-S,H=window.innerHeight-S,L=[W,H,W,H],dt=last?Math.min(t-last,100)/1000:0;last=t;
 var len=L[seg],v=len>=Math.max(W,H)?90:62;
 if(fz){var P=2*(W+H),q=(+fz[1])*P;seg=0;while(q>L[seg]&&seg<3){q-=L[seg];seg++}sp=q;pause=0;dt=0;len=L[seg];var fp=/[?&]critterph=([\d.]+)/.exec(location.search);ph=fp?+fp[1]:0}
 if(pause>0){pause-=dt}else{sp+=v*dt;ph+=dt/0.34;if(sp>=len){sp=0;seg=(seg+1)%4;pause=0.3;len=L[seg]}}
 var x,y,r,p=sp,fl=-1; /* art faces left: scaleX(-1) faces travel dir, then rotate so feet touch the edge */
 if(seg===0){x=p;y=H;r=0}else if(seg===1){x=W;y=H-p;r=-90}else if(seg===2){x=W-p;y=0;r=180}else{x=0;y=p;r=90}
 if(mode===0&&!fz){nextI-=dt;if(nextI<=0){var cs=cards();if(cs.length){var c=cs[ci%cs.length];ci+=3+Math.floor(Math.random()*5);tg=c;mode=1;ox=x;oy=y;cx=x;cy=y;bx=c.x+c.w*0.02;by0=c.y+c.h-S-2}else nextI=30}}
 if(mode){var gx=mode===3?ox:bx,gy=mode===3?oy:by0,ddx=gx-cx,ddy=gy-cy,dd=Math.sqrt(ddx*ddx+ddy*ddy),st2=170*dt;
  if(mode===2){stay-=dt;pause=0.01;if(stay<=0){mode=3;bub.style.opacity='0'}}
  else if(dd<=st2||dd<1){cx=gx;cy=gy;if(mode===1){mode=2;stay=4.2;showBub(tg)}else{mode=0;nextI=25+Math.random()*15}}
  else{cx+=ddx/dd*st2;cy+=ddy/dd*st2;fl=ddx<0?1:-1;sp-=v*dt}
  if(mode){x=cx;y=cy;r=0;if(mode===2)fl=1}}
 var tr='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r+'deg) scaleX('+fl+')';
 w.style.webkitTransform=tr;w.style.transform=tr;
 var f=ph-Math.floor(ph),by=0,sx=1,sy=1,lean=0;
 if(pause>0){var kk=pause/0.3;sx=1+0.05*kk;sy=1-0.05*kk;lean=3*kk}
 else{var h=Math.abs(Math.sin(2*Math.PI*f));by=-4*h;sy=1+0.03*h;sx=1-0.02*h;lean=-4}
 if(k==='bat'){by=-6+3*Math.sin(2*Math.PI*f);lean=0;sx=sy=1}
 var it='translate3d(0,'+by.toFixed(1)+'px,0) rotate('+lean.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
 ie.style.webkitTransform=it;ie.style.transform=it;
 pose(sv,k,f,pause>0)}catch(x){}raf(tick)}
function showBub(c){var fs=Math.max(22,Math.round(c.mw/58));bub.style.fontSize=fs+'px';
 bub.innerHTML=(c.n?'<b>'+c.n+'</b>':'')+c.s;var bh=bub.offsetHeight,bw=bub.offsetWidth,lx=Math.max(4,Math.min(c.x,window.innerWidth-bw-4)),ty=c.y-bh-6;
 if(ty<4){ty=c.y+c.h+14;bub.className='dn'}else bub.className='up';bub.style.left=lx+'px';bub.style.top=ty+'px';bub.style.opacity='1'}
bub.id='cbub';document.body.appendChild(bub);raf(tick)}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
}catch(x){}})();
