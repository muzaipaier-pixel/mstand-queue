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
[/^ロイヤルタピオカミルクティー/,'至尊珍奶','店里人气No.1','珍珠Q弹有嚼劲','奶茶香浓不腻','ロイヤルタピオカミルクティー','お店の人気No.1','タピオカもちもち','ミルクティー濃厚'],
[/アボカドスムージー/,'整颗牛油果','用整颗牛油果做','口感绵密顺滑','喝完超满足～','丸ごとアボカドスムージー','アボカド丸ごと','とろ～りなめらか','飲みごたえ満点～'],
[/^上品四季春/,'四季春茶','清新的乌龙茶香','入口回甘','配炸鸡超解腻～','上品四季春','さわやか烏龍茶','後味ほんのり甘い','唐揚げにも合うよ～'],
[/朝露ジャスミン/,'茉莉花茶','一口满满茉莉香','清爽不苦涩','想清淡就选它～','朝露ジャスミン','ジャスミンの香り','すっきり渋くない','あっさり派にどうぞ'],
[/ハイビスカス/,'扶桑花茶','酸酸甜甜的花茶','颜色红红超好看','拍照很出片哦～','ハイビスカスティー','甘酸っぱい花茶','きれいな赤色','写真映えするよ～'],
[/トウガン/,'冬瓜茶','古早味冬瓜茶','甜甜的很顺口','小时候的味道～','トウガン茶','昔ながらの冬瓜茶','やさしい甘さ','懐かしい味だよ～'],
[/マンゴーミルク/,'芒果多多','满满芒果果肉','配上香浓牛奶','芒果控必点～','たっぷりマンゴーミルク','果肉たっぷり','濃厚ミルクと一緒','マンゴー好き必見～'],
[/ドラゴンミルク/,'火龙果多多','火龙果配牛奶','粉粉的颜色','超好拍超可爱～','たっぷりドラゴンミルク','ドラゴンフルーツ','ミルクと合わせて','ピンクがかわいい～'],
[/いちごミルク|イチゴミルク/,'草莓多多','草莓配牛奶','酸酸甜甜','少女心满满～','たっぷりイチゴミルク','いちご×ミルク','甘酸っぱい','乙女心くすぐる～'],
[/黒糖/,'黑糖波波','黑糖珍珠','浓浓焦糖香','搅一搅再喝哦～','黒糖タピオカミルク','黒糖タピオカ','香ばしい黒糖','混ぜてから飲んでね'],
[/抹茶ミルク/,'抹茶牛奶','抹茶配牛奶','微苦又香甜','抹茶控快来～','もちもち抹茶ミルク','抹茶×ミルク','ほろ苦くて甘い','抹茶好きおいで～'],
[/Mixベリーミルク|ミックスベリーミルク/,'莓莓多多','好几种莓果','配上牛奶','酸甜又顺滑～','ミックスベリーミルク','ベリーいろいろ','ミルクと合わせて','甘酸っぱくなめらか'],
[/チーズクリーム四季春/,'芝士四季春','绵密芝士奶盖','配清香四季春','先喝一口奶盖～','チーズクリーム四季春','ふわふわチーズ','爽やか四季春と','まずクリームから～'],
[/チーズクリームジャスミン/,'芝士茉莉','绵绵芝士奶盖','配茉莉花香','清爽又浓郁～','チーズクリームジャスミン','ふわふわチーズ','ジャスミンの香り','爽やかで濃厚～'],
[/チーズクリーム宇治抹茶/,'芝士抹茶','宇治抹茶','加咸香芝士奶盖','抹茶控绝配～','チーズクリーム宇治抹茶','宇治抹茶','塩チーズクリーム','抹茶好きに最高～'],
[/ココナッツ/,'椰子牛奶冰','椰香满满','冰冰凉凉','一口好清爽～','ココナッツミルクフローズン','ココナッツの香り','ひんやり冷たい','すっきり爽やか～'],
[/満杯ドラゴンフルーツ/,'满杯火龙果','满满一杯火龙果','颜色超漂亮','清爽解渴～','満杯ドラゴンフルーツ','果肉ぎっしり','色がとってもきれい','さっぱり潤う～'],
[/満杯いちごスムージー|イチゴゴゴ/,'芝芝莓莓','满杯草莓','酸甜刚刚好','草莓控必点～','満杯イチゴゴゴ','いちごたっぷり','ほどよい甘酸っぱさ','いちご好き必見～'],
[/チェリー/,'满杯车厘子','车厘子满满','果香浓郁','车厘子控冲～','満杯チェリー','さくらんぼたっぷり','フルーティー','チェリー好きどうぞ'],
[/ヤンジー|楊枝甘露|杨枝甘露/,'杨枝甘露','芒果加西柚','港式经典甜品','一口好幸福～','ヤンジーカンルー','マンゴー×グレフル','香港の定番スイーツ','ひと口で幸せ～'],
[/Mixベリースムージー/,'综合莓果冰沙','新品上市！','多种莓果打成冰沙','酸甜冰爽～','Mixベリースムージー','新登場！','ベリーのスムージー','甘酸っぱくひんやり'],
[/ブルーベリー/,'蓝莓冰沙','新品上市！','蓝莓酸酸甜甜','冰沙口感超爽～','ブルーベリースムージー','新登場！','甘酸っぱいブルーベリー','シャリシャリ爽快～'],
[/パイナップル/,'海盐菠萝冰沙','新品上市！','海盐配菠萝','咸甜好特别～','海塩パイナップルスムージー','新登場！','塩×パイナップル','甘じょっぱいよ～'],
[/パッション/,'满杯百香果','百香果香到冒泡','酸甜开胃','超级清爽～','満杯パッションフルーツ','香りがはじける','甘酸っぱい','とっても爽やか～'],
[/タロ芋/,'芋头牛奶冰沙','绵绵的芋头','配上牛奶','芋泥控快来～','タロ芋ミルクスムージー','ほっくりタロ芋','ミルクと合わせて','タロ芋好きおいで～'],
[/爆ライム/,'爆青柠四季春','满满青柠','配四季春茶','清爽解腻～','爆ライム四季春','ライムたっぷり','四季春茶と一緒','さっぱり爽快～'],
[/柚子|ゆず/,'满杯蜂蜜柚橙','柚子加橙子','蜂蜜甜甜的','冷热都能点哦～','ゆずハニーオレンジ','柚子とオレンジ','はちみつで甘く','ホットもアイスもOK']];
var GEN=['这杯也超好喝','欢迎来尝尝哦～'],GJ=['こちらも美味しいよ～','ぜひ飲んでみてね～'];
function cards(){var R=[],i,j,mp=window.SOMAP,m=document.getElementById('menu');if(!m)m=document.querySelector('img[src*="menu"]');
 if(!m)return R;var mr=m.getBoundingClientRect();if(mr.width<50)return R;
 if(!mp||!mp.length){mp=[];for(i=0;i<PI.length;i++)mp.push({re:PI[i][0],x:5+(i%6)*15,y:10+Math.floor(i/6)*20,w:12,h:16})}
 var so=[],sk=document.getElementById('somask'),ds=sk?sk.getElementsByTagName('div'):[];
 for(i=0;i<ds.length;i++)if(/(^| )so( |$)/.test(ds[i].className)&&!/tp/.test(ds[i].className))so.push(ds[i].style.left+'|'+ds[i].style.top);
 for(j=0;j<mp.length;j++){var b=mp[j];if(so.indexOf(b.x+'%|'+b.y+'%')>=0)continue;
  var t=null;for(i=0;i<PI.length;i++)if(b.re&&PI[i][0].source===b.re.source){t=PI[i];break}
  if(!t)for(i=0;i<PI.length;i++)if(b.re&&b.re.test&&b.re.test(PI[i][1])){t=PI[i];break}
  R.push({x:mr.left+mr.width*b.x/100,y:mr.top+mr.height*b.y/100,w:mr.width*b.w/100,h:mr.height*b.h/100,n:t?t[1]:'',s:t?t.slice(2,5):GEN,jn:t?t[5]:'',js:t?t.slice(6,9):GJ,mw:mr.width})}
 return R}
window.MSCritterCards=cards;
if(/[?&]critter=off/.test(qs))return;
var st=document.createElement('style');
st.textContent='#critter{position:fixed;left:0;top:0;z-index:9000;pointer-events:none;will-change:transform;-webkit-transform:translate3d(-99px,0,0);transform:translate3d(-99px,0,0)}'+
'#cbub{position:fixed;z-index:9001;pointer-events:none;background:#fff;color:#5b2a86;border:4px solid #ff6fae;border-radius:.8em;padding:.25em .6em .3em;font-family:sans-serif;font-weight:700;line-height:1.3;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.35);opacity:0;-webkit-transform-origin:30px 100%;transform-origin:30px 100%;-webkit-transition:opacity .4s;transition:opacity .4s}#cbub.dn{-webkit-transform-origin:30px 0;transform-origin:30px 0}#cbub b{display:block;color:#ff3d8b;font-size:1.08em}#cbub span{display:block;opacity:0}#cbub span.on{opacity:1;-webkit-animation:cln .45s ease-out;animation:cln .45s ease-out}#cbub.pop{-webkit-animation:cpop .5s cubic-bezier(.3,1.6,.5,1);animation:cpop .5s cubic-bezier(.3,1.6,.5,1)}#cbub:after{content:"";position:absolute;left:28px;border:10px solid transparent}#cbub.up:after{top:100%;border-top-color:#ff6fae}#cbub.dn:after{bottom:100%;border-bottom-color:#ff6fae}'+
'@-webkit-keyframes cpop{0%{-webkit-transform:scale(.2);opacity:0}60%{-webkit-transform:scale(1.12);opacity:1}100%{-webkit-transform:scale(1)}}@keyframes cpop{0%{transform:scale(.2);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}'+
'@-webkit-keyframes cln{0%{opacity:0;-webkit-transform:translate3d(0,.5em,0)}100%{opacity:1;-webkit-transform:translate3d(0,0,0)}}@keyframes cln{0%{opacity:0;transform:translate3d(0,.5em,0)}100%{opacity:1;transform:translate3d(0,0,0)}}'+
'#cspk{position:fixed;left:0;top:0;width:1px;height:1px;z-index:9002;pointer-events:none;display:none}#cspk i{position:absolute;display:block;opacity:0;-webkit-animation:cflt 1.8s ease-out infinite;animation:cflt 1.8s ease-out infinite}'+
'@-webkit-keyframes cflt{0%{opacity:0;-webkit-transform:translate3d(0,0,0) scale(.4)}20%{opacity:1;-webkit-transform:translate3d(0,-10px,0) scale(1.1)}100%{opacity:0;-webkit-transform:translate3d(0,-60px,0) scale(.8)}}@keyframes cflt{0%{opacity:0;transform:translate3d(0,0,0) scale(.4)}20%{opacity:1;transform:translate3d(0,-10px,0) scale(1.1)}100%{opacity:0;transform:translate3d(0,-60px,0) scale(.8)}}'+
'#critter i{display:block;width:64px;height:64px;-webkit-transform-origin:50% 95%;transform-origin:50% 95%;will-change:transform}#critter svg{display:block;overflow:visible}';
document.getElementsByTagName('head')[0].appendChild(st);
var w=document.createElement('div');w.id='critter';w.innerHTML='<i>'+svg(k,hw)+'</i>';
function start(){var gen=window.__critterGen=(window.__critterGen||0)+1,ids=['critter','cbub','cspk'],ii,oe;for(ii=0;ii<ids.length;ii++){while((oe=document.getElementById(ids[ii]))&&oe.parentNode)oe.parentNode.removeChild(oe)}document.body.appendChild(w);var ie=w.firstChild,sv=ie.firstChild;
var S=64,fz=/[?&]critterpos=([\d.]+)/.exec(location.search),seg=0,sp=0,pause=0,last=0,ph=0,
mode=0,tg=null,ox=0,oy=0,cx=0,cy=0,bx=0,by0=0,stay=0,nextI=(/[?&]critterintro=1/.test(location.search)?1.5:2+Math.random()*2),trip=0,q=[],li=0,talk=0,pg=0,PG=5.4,spk=document.createElement('div'),ci=Math.floor(Math.random()*99),bub=document.createElement('div'),
lpx=-1,lpy=-1,lmv=+new Date(),raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){return setTimeout(function(){f(+new Date())},33)};
function tick(t){if(window.__critterGen!==gen){try{if(w.parentNode)w.parentNode.removeChild(w);if(bub.parentNode)bub.parentNode.removeChild(bub);if(spk.parentNode)spk.parentNode.removeChild(spk)}catch(e){}return}try{var W=window.innerWidth-S,H=window.innerHeight-S,L=[W,H,W,H],now=+new Date(),dt=last?Math.max(0,Math.min(now-last,100))/1000:0;last=now;
 var len=L[seg],v=len>=Math.max(W,H)?90:62;
 if(fz){var P=2*(W+H),fq=(+fz[1])*P;seg=0;while(fq>L[seg]&&seg<3){fq-=L[seg];seg++}sp=fq;pause=0;dt=0;len=L[seg];var fp=/[?&]critterph=([\d.]+)/.exec(location.search);ph=fp?+fp[1]:0}
 if(pause>0){pause-=dt}else{sp+=v*dt;ph+=dt/0.34;if(sp>=len){sp=0;seg=(seg+1)%4;pause=0.3;len=L[seg]}}
 var x,y,r,p=sp,fl=-1; /* art faces left: scaleX(-1) faces travel dir, then rotate so feet touch the edge */
 if(seg===0){x=p;y=H;r=0}else if(seg===1){x=W;y=H-p;r=-90}else if(seg===2){x=W-p;y=0;r=180}else{x=0;y=p;r=90}
 if(mode===0&&!fz){nextI-=dt;if(nextI<=0){var cs=cards();if(cs.length){q=[];var nq=Math.min(cs.length,2+Math.floor(Math.random()*2)),u,c;for(u=0;u<nq;u++){c=cs[ci%cs.length];ci+=2+Math.floor(Math.random()*4);if(q.indexOf(c)<0)q.push(c)}c=q.shift();tg=c;mode=1;ox=x;oy=y;cx=x;cy=y;bx=Math.max(0,c.x-S*0.55);by0=c.y+c.h*0.35-S/2}else nextI=5}}
 if(mode===1||mode===3){trip+=dt;if(trip>15){mode=0;trip=0;q=[];nextI=30;hideBub()}}else trip=0;
 if(mode===2&&stay<-3){mode=3;q=[];hideBub()}
 if(mode){var gx=mode===3?ox:bx,gy=mode===3?oy:by0,ddx=gx-cx,ddy=gy-cy,dd=Math.sqrt(ddx*ddx+ddy*ddy),st2=170*dt;
  if(mode===2){stay-=dt;talk+=dt;pause=0;ph+=dt/0.5;if(pg===0&&talk>=PG){pg=1;li=0;showBub(tg,1)}var nl=Math.min(3,1+Math.floor((talk-pg*PG)/1.2)),sps=bub.getElementsByTagName('span');while(li<nl&&li<sps.length){sps[li].className='on';li++}if(stay<=0){bub.style.opacity='0';spk.style.display='none';var nc=null,cs2=cards(),u2,z;while(q.length&&!nc){z=q.shift();for(u2=0;u2<cs2.length;u2++)if(cs2[u2].n===z.n)nc=cs2[u2]}if(nc){tg=nc;mode=1;bx=Math.max(0,nc.x-S*0.55);by0=nc.y+nc.h*0.35-S/2}else mode=3}}
  else if(dd<=st2||dd<1){cx=gx;cy=gy;if(mode===1){mode=2;talk=0;li=0;pg=0;stay=2*PG;showBub(tg,0)}else{mode=0;nextI=40+Math.random()*20}}
  else{cx+=ddx/dd*st2;cy+=ddy/dd*st2;fl=ddx<0?1:-1;sp-=v*dt}
  if(mode){x=cx;y=cy;r=0;if(mode===2)fl=1}}
 var tr='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r+'deg) scaleX('+fl+')';
 w.style.webkitTransform=tr;w.style.transform=tr;
 var f=ph-Math.floor(ph),by=0,sx=1,sy=1,lean=0;
 if(mode===2){var hp=Math.abs(Math.sin(Math.PI*talk*1.6));by=-14*hp;sy=1+0.06*hp;sx=1-0.04*hp;lean=8*Math.sin(Math.PI*talk*2.4)}
 else if(pause>0){var kk=pause/0.3;sx=1+0.05*kk;sy=1-0.05*kk;lean=3*kk}
 else{var h=Math.abs(Math.sin(2*Math.PI*f));by=-4*h;sy=1+0.03*h;sx=1-0.02*h;lean=-4}
 if(k==='bat'&&mode!==2){by=-6+3*Math.sin(2*Math.PI*f);lean=0;sx=sy=1}
 var it='translate3d(0,'+by.toFixed(1)+'px,0) rotate('+lean.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
 ie.style.webkitTransform=it;ie.style.transform=it;
 pose(sv,k,f,pause>0);
 var mv=Math.abs(x-lpx)+Math.abs(y-lpy);if(mv>0.5||mode===2){lpx=x;lpy=y;lmv=now}else if(now-lmv>12000){reset()}
 }catch(x){reset()}raf(tick)}
function hideBub(){try{bub.style.opacity='0';spk.style.display='none'}catch(e){}}
function reset(){mode=0;q=[];tg=null;trip=0;stay=0;talk=0;pause=0;nextI=30;lmv=+new Date();hideBub()}
function showBub(c0,jp){var c={x:c0.x,y:c0.y,w:c0.w,h:c0.h,mw:c0.mw,n:jp?c0.jn:c0.n,s:jp?c0.js:c0.s},fs=Math.max(22,Math.round(c.mw/60)),i,h='';bub.style.fontSize=fs+'px';
 for(i=0;i<c.s.length;i++)h+='<span>'+c.s[i]+'</span>';bub.className='';bub.innerHTML=(c.n?'<b>'+c.n+'</b>':'')+h;var bh=bub.offsetHeight,bw=bub.offsetWidth,lx=Math.max(4,Math.min(c.x,window.innerWidth-bw-4)),ty=c.y-bh-6,cl='up';
 if(ty<4){ty=c.y+c.h+14;cl='dn'}bub.style.left=lx+'px';bub.style.top=ty+'px';void bub.offsetWidth;bub.className=cl+' pop';bub.style.opacity='1';
 var sx2=c.x+c.w*0.75,sy2=c.y+c.h*0.6;spk.style.left=sx2+'px';spk.style.top=sy2+'px';spk.style.display='block'}
var HT='<svg width="26" height="24" viewBox="0 0 26 24"><path d="M13 23 C-6 10 3-4 13 6 C23-4 32 10 13 23Z" fill="#ff5c9a" stroke="#fff" stroke-width="2"/></svg>',
 SK='<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9Z" fill="#ffd84a" stroke="#fff" stroke-width="1.5"/></svg>',
 SP=[[0,0,HT,0],[30,-20,SK,.45],[-26,-30,SK,.9],[14,-44,HT,1.3],[-8,8,SK,1.1]],sh='',si;
for(si=0;si<SP.length;si++)sh+='<i style="left:'+SP[si][0]+'px;top:'+SP[si][1]+'px;-webkit-animation-delay:'+SP[si][3]+'s;animation-delay:'+SP[si][3]+'s">'+SP[si][2]+'</i>';
spk.id='cspk';spk.innerHTML=sh;document.body.appendChild(spk);
bub.id='cbub';document.body.appendChild(bub);raf(tick)}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
}catch(x){}})();
