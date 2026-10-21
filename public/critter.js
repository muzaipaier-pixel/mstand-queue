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
[/^上品四季春/,'四季春茶','清新的乌龙茶香','入口回甘','配炸鸡超解腻～','上品四季春','さわやか烏龍茶','後味ほんのり甘い','ごはんにも合うよ～'],
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
'#cbub{-webkit-animation:cbd 2.4s linear infinite;animation:cbd 2.4s linear infinite}#cbub em{font-style:normal;display:inline-block;-webkit-animation:crb 2.4s linear infinite;animation:crb 2.4s linear infinite;text-shadow:-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff,0 2px 3px rgba(60,20,90,.55)}#cbub b em{-webkit-animation:crb 2.4s linear infinite,cbw 1.1s ease-in-out infinite;animation:crb 2.4s linear infinite,cbw 1.1s ease-in-out infinite}#cbub b{font-size:1.25em}#cbub .gw{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;border-radius:.6em}#cbub .gl{position:absolute;top:-20%;left:0;width:35%;height:140%;background:-webkit-linear-gradient(left,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0));background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0));-webkit-animation:cgl 2.2s ease-in-out infinite;animation:cgl 2.2s ease-in-out infinite}#cbub i.cs{position:absolute;width:26px;height:26px;-webkit-animation:csp 1.6s linear infinite;animation:csp 1.6s linear infinite}#cbub i.cs svg{display:block}#cbub.pop{-webkit-animation:cpop2 .9s cubic-bezier(.3,1.5,.5,1),cbd 2.4s linear infinite;animation:cpop2 .9s cubic-bezier(.3,1.5,.5,1),cbd 2.4s linear infinite}#cbub.flip{-webkit-animation:cflip .7s ease-out,cbd 2.4s linear infinite;animation:cflip .7s ease-out,cbd 2.4s linear infinite}#cbub.flip .gl{-webkit-animation:cgl .7s ease-out 1,cgl 2.2s ease-in-out .7s infinite;animation:cgl .7s ease-out 1,cgl 2.2s ease-in-out .7s infinite}#cbub.up:after{-webkit-animation:ctu 2.4s linear infinite;animation:ctu 2.4s linear infinite}#cbub.dn:after{-webkit-animation:ctd 2.4s linear infinite;animation:ctd 2.4s linear infinite}#cfx{position:fixed;left:0;top:0;width:1px;height:1px;z-index:9003;pointer-events:none}#cfx b{position:absolute;left:0;top:0;display:block}#cfx .rg{border:5px solid #ffd84a;border-radius:50%;-webkit-animation:crg .8s ease-out forwards;animation:crg .8s ease-out forwards}'+
'@-webkit-keyframes crb{0%{color:#ff3b5c}16%{color:#ff9f1c}33%{color:#ffd60a}50%{color:#2ec95c}66%{color:#1fa8ff}83%{color:#a05cff}100%{color:#ff3b5c}}@keyframes crb{0%{color:#ff3b5c}16%{color:#ff9f1c}33%{color:#ffd60a}50%{color:#2ec95c}66%{color:#1fa8ff}83%{color:#a05cff}100%{color:#ff3b5c}}@-webkit-keyframes cbd{0%{border-color:#ff3b5c}16%{border-color:#ff9f1c}33%{border-color:#ffd60a}50%{border-color:#2ec95c}66%{border-color:#1fa8ff}83%{border-color:#a05cff}100%{border-color:#ff3b5c}}@keyframes cbd{0%{border-color:#ff3b5c}16%{border-color:#ff9f1c}33%{border-color:#ffd60a}50%{border-color:#2ec95c}66%{border-color:#1fa8ff}83%{border-color:#a05cff}100%{border-color:#ff3b5c}}@-webkit-keyframes ctu{0%{border-top-color:#ff3b5c}16%{border-top-color:#ff9f1c}33%{border-top-color:#ffd60a}50%{border-top-color:#2ec95c}66%{border-top-color:#1fa8ff}83%{border-top-color:#a05cff}100%{border-top-color:#ff3b5c}}@keyframes ctu{0%{border-top-color:#ff3b5c}16%{border-top-color:#ff9f1c}33%{border-top-color:#ffd60a}50%{border-top-color:#2ec95c}66%{border-top-color:#1fa8ff}83%{border-top-color:#a05cff}100%{border-top-color:#ff3b5c}}@-webkit-keyframes ctd{0%{border-bottom-color:#ff3b5c}16%{border-bottom-color:#ff9f1c}33%{border-bottom-color:#ffd60a}50%{border-bottom-color:#2ec95c}66%{border-bottom-color:#1fa8ff}83%{border-bottom-color:#a05cff}100%{border-bottom-color:#ff3b5c}}@keyframes ctd{0%{border-bottom-color:#ff3b5c}16%{border-bottom-color:#ff9f1c}33%{border-bottom-color:#ffd60a}50%{border-bottom-color:#2ec95c}66%{border-bottom-color:#1fa8ff}83%{border-bottom-color:#a05cff}100%{border-bottom-color:#ff3b5c}}@-webkit-keyframes cbw{0%,100%{-webkit-transform:translate3d(0,0,0)}50%{-webkit-transform:translate3d(0,-.18em,0)}}@keyframes cbw{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-.18em,0)}}@-webkit-keyframes cgl{0%{-webkit-transform:translate3d(-120%,0,0) skewX(-20deg)}60%,100%{-webkit-transform:translate3d(320%,0,0) skewX(-20deg)}}@keyframes cgl{0%{transform:translate3d(-120%,0,0) skewX(-20deg)}60%,100%{transform:translate3d(320%,0,0) skewX(-20deg)}}@-webkit-keyframes csp{0%{-webkit-transform:rotate(0) scale(.7)}50%{-webkit-transform:rotate(180deg) scale(1.15)}100%{-webkit-transform:rotate(360deg) scale(.7)}}@keyframes csp{0%{transform:rotate(0) scale(.7)}50%{transform:rotate(180deg) scale(1.15)}100%{transform:rotate(360deg) scale(.7)}}@-webkit-keyframes cpop2{0%{-webkit-transform:scale(.1) rotate(-12deg);opacity:0}45%{-webkit-transform:scale(1.18) rotate(4deg);opacity:1}62%{-webkit-transform:scale(.94) rotate(-3deg)}78%{-webkit-transform:scale(1.04) rotate(1.5deg)}100%{-webkit-transform:scale(1) rotate(0)}}@keyframes cpop2{0%{transform:scale(.1) rotate(-12deg);opacity:0}45%{transform:scale(1.18) rotate(4deg);opacity:1}62%{transform:scale(.94) rotate(-3deg)}78%{transform:scale(1.04) rotate(1.5deg)}100%{transform:scale(1) rotate(0)}}@-webkit-keyframes cflip{0%{-webkit-transform:perspective(600px) rotateX(0)}45%{-webkit-transform:perspective(600px) rotateX(90deg)}55%{-webkit-transform:perspective(600px) rotateX(-90deg)}100%{-webkit-transform:perspective(600px) rotateX(0)}}@keyframes cflip{0%{transform:perspective(600px) rotateX(0)}45%{transform:perspective(600px) rotateX(90deg)}55%{transform:perspective(600px) rotateX(-90deg)}100%{transform:perspective(600px) rotateX(0)}}@-webkit-keyframes crg{0%{-webkit-transform:scale(.2);opacity:1}100%{-webkit-transform:scale(1.6);opacity:0}}@keyframes crg{0%{transform:scale(.2);opacity:1}100%{transform:scale(1.6);opacity:0}}'+
'.crf{position:fixed;left:0;top:0;z-index:8999;pointer-events:none;will-change:transform;-webkit-transform:translate3d(-99px,0,0);transform:translate3d(-99px,0,0)}.crf i{display:block;width:64px;height:64px;-webkit-transform-origin:50% 95%;transform-origin:50% 95%}.crf svg{display:block;overflow:visible}'+
'#critter i{display:block;width:64px;height:64px;-webkit-transform-origin:50% 95%;transform-origin:50% 95%;will-change:transform}#critter svg{display:block;overflow:visible}';
document.getElementsByTagName('head')[0].appendChild(st);
var w=document.createElement('div');w.id='critter';w.innerHTML='<i>'+svg(k,hw)+'</i>';
function hipFor(key){return key==='chick'?{l0:[38,52],l1:[30,50],ct:[38,40],ce:[31,18]}:key==='bat'?{l0:[24,34],l1:[40,34]}:{l0:[33,47],l1:[29,47],l2:[51,47],l3:[47,47],ct:[54,42],ce:[22,20]}}
function poseK(r,key,f,stop){var o=HIP;HIP=hipFor(key);try{pose(r,key,f,stop)}catch(e){}HIP=o}
/* ---- voice: pre-generated Edge neural TTS clips (public/voice/critter); never overlaps queue calls ---- */
var VM=null,ca=null,clog=window.__critterLog=[];
try{var xr=new XMLHttpRequest();xr.open('GET','/voice/critter/manifest.json?v=2',true);xr.onreadystatechange=function(){if(xr.readyState===4&&xr.status===200){try{VM=JSON.parse(xr.responseText)}catch(e){}}};xr.send()}catch(e){}
function vbusy(){var ids=['vo','chime'],i,a;for(i=0;i<ids.length;i++){a=document.getElementById(ids[i]);if(a&&!a.paused&&!a.ended&&a.volume>0)return true}return false}
function ventry(lang,key){if(!VM||!VM[lang])return null;return VM[lang][key]||VM[lang]['']||null}
function vdur(lang,key){var e=ventry(lang,key);return e?e.d:0}
function vplay(lang,key){var e=ventry(lang,key);if(!e||!ca)return;if(window.SOUND===false||vbusy()){clog.push('skip '+e.f);return}
 try{ca.pause();ca.src='/voice/critter/'+e.f+'?v='+(VM&&VM.v||1);ca.volume=0.6*(typeof window.SVOL==='number'?window.SVOL:1);clog.push('play '+e.f);var pr=ca.play();if(pr&&pr.then)pr.then(function(){clog.push('ok '+e.f);if(window.__alog)window.__alog('critter ok '+e.f)},function(er){clog.push('blocked '+e.f);if(window.__alog)window.__alog('critter blocked '+e.f+' '+(er&&er.name))})}catch(x){}}
window.__critterStop=function(){vstop()};function vstop(){try{if(ca&&!ca.paused){ca.pause();clog.push('stop')}}catch(e){}}
function start(){var gen=window.__critterGen=(window.__critterGen||0)+1,ids=['critter','cbub','cspk','cfx','caud'],ii,oe;for(ii=0;ii<ids.length;ii++){while((oe=document.getElementById(ids[ii]))&&oe.parentNode)oe.parentNode.removeChild(oe)}var ofr=document.querySelectorAll('.crf');for(ii=0;ii<ofr.length;ii++)if(ofr[ii].parentNode)ofr[ii].parentNode.removeChild(ofr[ii]);try{ca=document.createElement('audio');ca.id='caud';ca.preload='none';document.body.appendChild(ca);var ul=function(){try{if(ca.src||!ca.paused)return;ca.src='/gap.mp3';ca.volume=0;var pp=ca.play();if(pp&&pp['catch'])pp['catch'](function(){})}catch(e){}};document.addEventListener('click',ul,false);document.addEventListener('touchstart',ul,false)}catch(e){ca=null}document.body.appendChild(w);var ie=w.firstChild,sv=ie.firstChild;
var S=64,fz=/[?&]critterpos=([\d.]+)/.exec(location.search),seg=0,sp=0,pause=0,last=0,ph=0,
mode=0,tg=null,ox=0,oy=0,cx=0,cy=0,bx=0,by0=0,stay=0,nextI=(/[?&]critterintro=1/.test(location.search)?1.5:2+Math.random()*2),trip=0,q=[],li=0,talk=0,pg=0,hn=0,PG=5.4,spk=document.createElement('div'),ci=Math.floor(Math.random()*99),bub=document.createElement('div'),
P0=5.4,P1=5.4,FR=[],HIS=[],evT=10+Math.random()*6,ev=null,evt=0,lpx=-1,lpy=-1,lmv=+new Date(),raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){return setTimeout(function(){f(+new Date())},33)};
function tick(t){if(window.__critterGen!==gen){try{if(w.parentNode)w.parentNode.removeChild(w);if(bub.parentNode)bub.parentNode.removeChild(bub);if(spk.parentNode)spk.parentNode.removeChild(spk);if(fxl.parentNode)fxl.parentNode.removeChild(fxl);for(var fi=0;fi<FR.length;fi++)if(FR[fi].e.parentNode)FR[fi].e.parentNode.removeChild(FR[fi].e);vstop()}catch(e){}return}if(window.__callBusy&&+new Date()<window.__callBusy){last=0;vstop();if(SC)scEnd();setTimeout(function(){raf(tick)},400);return}try{var W=window.innerWidth-S,H=window.innerHeight-S,L=[W,H,W,H],now=+new Date(),dt=last?Math.max(0,Math.min(now-last,100))/1000:0;last=now;
 var len=L[seg],v=len>=Math.max(W,H)?90:62;
 if(fz){var P=2*(W+H),fq=(+fz[1])*P;seg=0;while(fq>L[seg]&&seg<3){fq-=L[seg];seg++}sp=fq;pause=0;dt=0;len=L[seg];var fp=/[?&]critterph=([\d.]+)/.exec(location.search);ph=fp?+fp[1]:0}
 if(SC&&mode===0){ph+=dt/0.3}else if(pause>0){pause-=dt}else{sp+=v*dt;ph+=dt/0.34;if(sp>=len){sp=0;seg=(seg+1)%4;pause=0.3;len=L[seg]}}
 var x,y,r,p=sp,fl=-1; /* art faces left: scaleX(-1) faces travel dir, then rotate so feet touch the edge */
 if(seg===0){x=p;y=H;r=0}else if(seg===1){x=W;y=H-p;r=-90}else if(seg===2){x=W-p;y=0;r=180}else{x=0;y=p;r=90}
 if(mode===0&&!fz&&!SC){nextI-=dt;if(nextI<=0){var cs=cards();if(cs.length){q=[];var nq=Math.min(cs.length,2+Math.floor(Math.random()*2)),u,c;for(u=0;u<nq;u++){c=cs[ci%cs.length];ci+=2+Math.floor(Math.random()*4);if(q.indexOf(c)<0)q.push(c)}c=q.shift();tg=c;mode=1;ox=x;oy=y;cx=x;cy=y;bx=Math.max(0,c.x-S*0.55);by0=c.y+c.h*0.35-S/2}else nextI=5}}
 if(mode===1||mode===3){trip+=dt;if(trip>15){mode=0;trip=0;q=[];nextI=30;hideBub()}}else trip=0;
 if(mode===2&&stay<-3){mode=3;q=[];hideBub()}
 if(mode){var gx=mode===3?ox:bx,gy=mode===3?oy:by0,ddx=gx-cx,ddy=gy-cy,dd=Math.sqrt(ddx*ddx+ddy*ddy),st2=170*dt;
  if(mode===2){stay-=dt;talk+=dt;pause=0;ph+=dt/0.5;if(pg===0&&talk>=P0){pg=1;li=0;showBub(tg,1);vplay('ja',tg.jn)}var nl=Math.min(3,1+Math.floor((talk-(pg?P0:0))/((pg?P1:P0)/4.5))),sps=bub.getElementsByTagName('span');while(li<nl&&li<sps.length){sps[li].className='on';li++}if(stay<=0){bub.style.opacity='0';spk.style.display='none';var nc=null,cs2=cards(),u2,z;while(q.length&&!nc){z=q.shift();for(u2=0;u2<cs2.length;u2++)if(cs2[u2].n===z.n)nc=cs2[u2]}if(nc){tg=nc;mode=1;bx=Math.max(0,nc.x-S*0.55);by0=nc.y+nc.h*0.35-S/2}else mode=3}}
  else if(dd<=st2||dd<1){cx=gx;cy=gy;if(mode===1){mode=2;talk=0;li=0;pg=0;hn=0.9;P0=pgl('zh',tg.n);P1=pgl('ja',tg.jn);stay=P0+P1;showBub(tg,0);vplay('zh',tg.n);try{burst(tg.x+tg.w/2,tg.y+tg.h*0.45,16)}catch(e){}}else{mode=0;nextI=40+Math.random()*20}}
  else{cx+=ddx/dd*st2;cy+=ddy/dd*st2;fl=ddx<0?1:-1;sp-=v*dt}
  if(mode){x=cx;y=cy;r=0;if(mode===2)fl=1}}
 var SP0=(SC&&mode===0)?scPose(now):null,sm=SP0?SP0[0]:null;if(sm){x=SC.mx+sm.dx;y=SC.my;r=0;fl=sm.fl}
 var tr='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r+'deg) scaleX('+fl+')';
 w.style.webkitTransform=tr;w.style.transform=tr;
 var f=ph-Math.floor(ph),by=0,sx=1,sy=1,lean=0;
 if(sm){by=-sm.lift;sx=sm.sx;sy=sm.sy;lean=sm.rot}
 else if(mode===2){var hp=Math.abs(Math.sin(Math.PI*talk*1.6));by=-14*hp;sy=1+0.06*hp;sx=1-0.04*hp;lean=8*Math.sin(Math.PI*talk*2.4);if(talk<0.7){var sq=talk/0.7;lean=360*sq;by=-60*Math.sin(Math.PI*sq)}hn-=dt;if(hn<=0){hn=1.1;part(x+20+Math.random()*24,y+4,(Math.random()-.5)*60,-120,60,1300,HT,(Math.random()-.5)*90)}}
 else if(pause>0){var kk=pause/0.3;sx=1+0.05*kk;sy=1-0.05*kk;lean=3*kk}
 else{var h=Math.abs(Math.sin(2*Math.PI*f));by=-4*h;sy=1+0.03*h;sx=1-0.02*h;lean=-4}
 if(k==='bat'&&mode!==2&&!sm){by=-6+3*Math.sin(2*Math.PI*f);lean=0;sx=sy=1}
 var it='translate3d(0,'+by.toFixed(1)+'px,0) rotate('+lean.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
 ie.style.webkitTransform=it;ie.style.transform=it;
 pose(sv,k,f,sm?!sm.m:pause>0);if(vbusy())vstop();try{friends(now,dt,x,y,r,fl)}catch(e){}fxTick();
 var mv=Math.abs(x-lpx)+Math.abs(y-lpy);if(mv>0.5||mode===2||sm){lpx=x;lpy=y;lmv=now}else if(now-lmv>12000){reset()}
 }catch(x){reset()}raf(tick)}
function pgl(l,key){var d2=vdur(l,key);return d2?Math.max(4.2,Math.min(8,d2+0.9)):PG}
function hist(lag,now){var tt=now-lag*1000,i;for(i=HIS.length-1;i>0;i--)if(HIS[i].t<=tt)return HIS[i];return HIS[0]}
function friends(now,dt,x,y,r,fl){if(!FR.length)return;if(!SC)HIS.push({t:now,x:x,y:y,r:r,fl:fl});while(HIS.length>2&&HIS[0].t<now-5000)HIS.shift();
 if(mode===0){if(!SC){evT-=dt;var Wf=window.innerWidth-S;if(evT<=0&&seg===0&&sp>Wf*0.2&&sp<Wf*0.75)scStart(now,x,y)}}else if(SC)scEnd();
 var i,o,tx,ty,tr,tf,lag,lift=0,spin=0;
 for(i=0;i<FR.length;i++){o=FR[i];lag=o.bl;lift=0;spin=0;o.ph+=dt/0.34;
  if(SC&&SC.P){var pp=SC.P[i+1],bl2=eo(sg(SC.t,0,0.6));o.x=SC.st[i]+(SC.mx+pp.dx-SC.st[i])*bl2;o.y=SC.my;o.lx=o.x;o.ly=o.y;o.lmv=now;
   var u1='translate3d('+o.x.toFixed(1)+'px,'+o.y.toFixed(1)+'px,0) scaleX('+pp.fl+')';o.e.style.webkitTransform=u1;o.e.style.transform=u1;
   var u2='translate3d(0,'+(-pp.lift).toFixed(1)+'px,0) rotate('+pp.rot.toFixed(1)+'deg) scale('+pp.sx.toFixed(3)+','+pp.sy.toFixed(3)+')';o.ie.style.webkitTransform=u2;o.ie.style.transform=u2;
   poseK(o.sv,o.k,o.ph-Math.floor(o.ph),!pp.m);continue}
  if(mode===0){
   if(ev==='five'){lag=o.bl*(1-0.62*Math.sin(Math.PI*Math.min(1,evt/2.4)));if(i===0&&!o.hf&&evt>1.1){o.hf=1;var hh=hist(lag*0.5,now);part(hh.x+32,hh.y-10,0,-140,40,1400,HT,0);part(hh.x+24,hh.y-6,-50,-120,40,1300,HT,-60);part(hh.x+40,hh.y-6,50,-120,40,1300,SK,90)}lift=8*Math.abs(Math.sin(Math.PI*evt*2.5))}
   else if(ev==='hop'&&i===0){var u=Math.min(1,evt/1.2),dn=evt>3?Math.min(1,(evt-3)/1.2):0;lag=o.bl*(1-u)+o.bl*dn;lag=Math.max(0.02,lag);lift=evt<1.2?90*Math.sin(Math.PI*u)+36*u:evt<3?36:36*(1-dn)+70*Math.sin(Math.PI*dn);spin=evt<1.2?360*u:0}
   else if(ev==='chase'){lag=o.bl+0.45*Math.sin(evt*2.6+i*1.4)*Math.min(1,evt,(4.5-evt));lift=5*Math.abs(Math.sin(Math.PI*evt*3))}
   if(!ev)o.hf=0;
   var h=hist(lag,now);tx=h.x;ty=h.y;tr=h.r;tf=h.fl}
  else{tx=Math.max(0,cx-70*(i+1));ty=cy+8;tr=0;tf=-1;if(mode===2){lift=18*Math.abs(Math.sin(Math.PI*(talk*1.8+i*0.5)));o.sk=(o.sk||0)-dt;if(o.sk<=0){o.sk=1.6+Math.random();part(tx+20+Math.random()*24,ty,(Math.random()-.5)*50,-110,60,1100,i?SK:HT,(Math.random()-.5)*90)}}}
  if(o.x===undefined){o.x=tx;o.y=ty}
  var ddx=tx-o.x,ddy=ty-o.y,dd=Math.sqrt(ddx*ddx+ddy*ddy),stp=260*dt;
  if(dd<=stp||(mode===0&&dd<4)){o.x=tx;o.y=ty}else{o.x+=ddx/dd*stp;o.y+=ddy/dd*stp;tr=0;tf=ddx<0?1:-1}
  if(Math.abs(o.x-o.lx)+Math.abs(o.y-o.ly)>0.5||mode===2||lift>0){o.lx=o.x;o.ly=o.y;o.lmv=now}else if(now-o.lmv>12000){o.x=tx;o.y=ty;o.lmv=now} /* watchdog */
  var t1='translate3d('+o.x.toFixed(1)+'px,'+o.y.toFixed(1)+'px,0) rotate('+tr+'deg) scaleX('+tf+')';o.e.style.webkitTransform=t1;o.e.style.transform=t1;
  var bb=Math.abs(Math.sin(2*Math.PI*o.ph)),t2='translate3d(0,'+(-4*bb-lift).toFixed(1)+'px,0) rotate('+(spin-4).toFixed(0)+'deg)';o.ie.style.webkitTransform=t2;o.ie.style.transform=t2;
  poseK(o.sv,o.k,o.ph-Math.floor(o.ph),mode===2)}}
/* v13 friend scenes: story beats (approach -> react -> payoff -> home). Date-based t, props cap 6, particles via part() (cap 40) */
var SC=null,PROPS=[],SCN=['hug','peek','clink','tag','nap'],sci=Math.floor(Math.random()*5);
var qsc=/[?&]scene=(hug|peek|clink|tag|nap)/.exec(location.search);if(qsc){SCN=[qsc[1]];evT=1.5;nextI=9999}
window.__csc=function(){return SC?SC.k+' '+(SC.t||0).toFixed(1)+' mx'+Math.round(SC.mx):'-'};
function cl(v){return v<0?0:v>1?1:v}
function sg(t,a,b){return cl((t-a)/(b-a))}
function eo(u){return 1-(1-u)*(1-u)*(1-u)}
function eio(u){return u<0.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function mv(t,a,b,p0,p1,n,h){var u=sg(t,a,b),e=eio(u),m=u>0&&u<1,sx=1,sy=1,lf=0;if(m&&n){var pp=(u*n)%1,s=pp<0.18?1-pp/0.18:pp>0.88?(pp-0.88)/0.12:0;sx=1+0.13*s;sy=1-0.15*s;lf=h*Math.sin(Math.PI*pp)}return {dx:p0+(p1-p0)*e,lift:lf,sx:sx,sy:sy,rot:0,fl:p1<p0?1:-1,m:m}}
function idl(dx,t,fl){var b=Math.abs(Math.sin(t*3.1));return {dx:dx,lift:2*b,sx:1-0.015*b,sy:1+0.02*b,rot:0,fl:fl||-1,m:false}}
function txt(s,c,z){return '<span style="display:block;font:900 '+z+'px sans-serif;color:'+c+';text-shadow:-2px -2px 0 #fff,2px -2px 0 #fff,-2px 2px 0 #fff,2px 2px 0 #fff,0 3px 4px rgba(0,0,0,.35)">'+s+'</span>'}
var CUP='<svg width="30" height="40" viewBox="0 0 30 40"><rect x="16" y="0" width="4" height="14" rx="2" fill="#ff6fae" transform="rotate(12 18 7)"/><path d="M4 10 H26 L23 38 H7Z" fill="#fff" stroke="#5b2a86" stroke-width="2"/><path d="M5.5 18 H24.5 L23 38 H7Z" fill="#f7c59f"/><circle cx="11" cy="33" r="2.4" fill="#3a2418"/><circle cx="16" cy="34" r="2.4" fill="#3a2418"/><circle cx="20" cy="32" r="2.4" fill="#3a2418"/></svg>',
 DUST='<i style="display:block;width:18px;height:18px;border-radius:50%;background:rgba(210,200,190,.9)"></i>';
function prop(html){if(PROPS.length>=6)return null;var e=document.createElement('b');e.innerHTML=html;fxl.appendChild(e);PROPS.push(e);return e}
function pset(e,x,y,r,s,o){if(!e)return;var t='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r.toFixed(1)+'deg) scale('+s.toFixed(3)+')';e.style.webkitTransform=t;e.style.transform=t;e.style.opacity=o.toFixed(2)}
function scEnd(){if(SC){var dS=+new Date()-SC.t0;for(var hi=0;hi<HIS.length;hi++)HIS[hi].t+=dS}SC=null;for(var i=0;i<PROPS.length;i++)if(PROPS[i].parentNode)PROPS[i].parentNode.removeChild(PROPS[i]);PROPS=[];evT=18+Math.random()*12}
function once(k){if(SC.f[k])return false;SC.f[k]=1;return true}
function every(k,t,a,b,p){if(t<a||t>b)return false;return once(k+Math.floor((t-a)/p))}
function hx(dx){return SC.mx+dx+S/2}function hy(lf){return SC.my-6-(lf||0)}
function bang(dx,s,c){part(hx(dx)-10,hy()-34,0,-36,0,1100,txt(s||'!',c||'#ff3d8b',s&&s.length>1?26:40),0)}
function heart(dx){part(hx(dx)-13+(Math.random()-.5)*16,hy()-10,(Math.random()-.5)*30,-70,0,1500,HT,(Math.random()-.5)*40)}
function note(dx){part(hx(dx)-8,hy()-24,(Math.random()-.5)*40,-60,0,1200,txt('\u266a','#a05cff',26),(Math.random()-.5)*60)}
function zz(dx,big){part(hx(dx)+4,hy()-18,18,-34,0,1900,txt(big?'Z':'z','#7a8cff',big?30:22),10)}
function twinkle(dx){part(hx(dx)-12+(Math.random()-.5)*30,hy()-30,(Math.random()-.5)*40,-50,0,1000,SK,(Math.random()-.5)*200)}
var HOME=[0,-76,-153];
function scene(t){var A=[],k=SC.k,i,m,f0,f1,c;
 if(k==='hug'){ // f0 notices -> runs over -> hug + hearts -> back -> wave
  if(t<0.3)f0=idl(HOME[1],t);else if(t<1.7)f0=mv(t,0.6,1.7,HOME[1],-44,3,22);else if(t<3.9){var sq=Math.sin((t-1.7)*7)*0.03;f0={dx:-44,lift:0,sx:1.08+sq,sy:0.93-sq,rot:0,fl:-1,m:false}}else if(t<5.1)f0=mv(t,3.9,5.1,-44,HOME[1],2,18);else{f0=idl(HOME[1],t);f0.rot=14*Math.sin((t-5.1)*11)}
  if(t>0.2&&once('n'))bang(HOME[1]);
  if(t<0.9)m=idl(0,t);else if(t<3.9){var s2=Math.sin((t-1.7)*7)*0.03;m={dx:0,lift:0,sx:1.08+s2,sy:0.93-s2,rot:0,fl:1,m:false}}else{m=idl(0,t,t<5.1?1:-1);if(t>5.1)m.rot=10*Math.sin((t-5.1)*11)}
  if(t>0.8&&t<0.95&&once('ni'))bang(0,'\u266a','#a05cff');
  if(every('h',t,1.8,3.7,0.4))heart(-22);
  f1=idl(HOME[2],t);if(t>1.9&&t<3.9){f1.lift=14*Math.abs(Math.sin((t-1.9)*6));}if(every('s',t,2,3.8,0.9))twinkle(HOME[2]);if(t>5.1)f1.rot=14*Math.sin((t-5.1)*11+1);
 }else if(k==='peek'){ // f0 hides behind main -> pops left (surprise) -> hides -> pops right -> giggles
  if(t<1.4)f0=mv(t,0.3,1.4,HOME[1],-4,3,14);else if(t<1.9){f0=idl(-4,t);f0.sy=0.8;f0.sx=1.1}else if(t<2.6){f0=mv(t,1.9,2.2,-4,-50,1,34);if(t>=2.2)f0=idl(-50,t,1)}else if(t<3.2){f0=mv(t,2.6,3.0,-50,-4,1,10);f0.sy=Math.min(f0.sy,0.85)}else if(t<4.4){f0=mv(t,3.3,3.6,-4,48,1,36);if(t>=3.6){f0=idl(48,t,1);}}else if(t<5.3){f0=idl(48,t,1);f0.lift=12*Math.abs(Math.sin((t-4.4)*7))}else f0=mv(t,5.3,6.8,48,HOME[1],3,18);
  if(t>2.05&&once('b1'))bang(-50,'\u3070\u3041\uff01','#ff6f3c');
  if(t>3.45&&once('b2'))bang(48,'\u3070\u3041\uff01','#ff6f3c');
  if(t<2.1)m=idl(0,t);else if(t<2.6){m=mv(t,2.1,2.6,0,0,1,30);m.fl=1}else if(t<3.5)m=idl(0,t,1);else if(t<4.0){m=mv(t,3.5,4.0,0,0,1,30);m.fl=-1}else if(t<5.3){m=idl(0,t,-1);m.lift=12*Math.abs(Math.sin((t-4.4)*7+0.6))}else m=idl(0,t);
  if(t>2.15&&once('e1'))bang(0);if(t>3.55&&once('e2'))bang(0);
  if(every('g',t,4.4,5.2,0.35))(Math.random()<0.5?note:heart)(Math.random()<0.5?0:48);
  f1=idl(HOME[2],t);if((t>2.1&&t<2.6)||(t>3.5&&t<4.0))f1.lift=10*Math.abs(Math.sin(t*9));if(t>2.2&&once('f1'))note(HOME[2]);
 }else if(k==='clink'){ // approach -> cups pop -> lean in, clink! -> sip -> hearts -> home
  f0=t<1.3?mv(t,0.2,1.3,HOME[1],-52,2,18):t<5.2?idl(-52,t):mv(t,5.2,6.6,-52,HOME[1],2,18);m=idl(0,t,t>1.0&&t<5.2?1:-1);
  if(!SC.c){SC.c=[prop(CUP),prop(CUP)]}
  var ap=eo(sg(t,1.3,1.7)),gone=1-sg(t,4.6,5.1),lean=eio(sg(t,2.0,2.5))-eio(sg(t,2.7,3.0)),sip=Math.sin(Math.PI*sg(t,3.0,4.2));
  var cs=(ap<1?1.25*ap-0.25*ap*ap*ap:1)*(0.6+0.4*gone);
  if(t>2.0&&t<3.0){m.rot=-6*lean;f0.rot=6*lean}if(sip>0){m.sy=1-0.05*sip;f0.sy=1-0.05*sip}
  pset(SC.c[0],hx(0)-34-10*lean,hy()-46-6*sip,-18*lean-30*sip,cs,ap*gone);pset(SC.c[1],hx(-52)+4+10*lean,hy()-46-6*sip,18*lean+30*sip,cs,ap*gone);
  if(t>2.5&&once('ck')){for(i=0;i<5;i++)part(hx(-26)-12,hy()-50,(Math.random()-.5)*160,-60-Math.random()*90,160,900,SK,(Math.random()-.5)*300);bang(-26,'\u266a','#a05cff')}
  if(every('h',t,4.0,4.8,0.35))heart(-26);
  f1=idl(HOME[2],t);if(t>2.5&&t<3.3)f1.lift=12*Math.abs(Math.sin((t-2.5)*8));if(t>2.6&&once('f1'))note(HOME[2]);
 }else if(k==='tag'){ // tap! -> main runs, f0 chases (giggles) -> f0 trips & rolls -> main comes back, heart -> home
  var R=Math.min(140,Math.max(60,SC.room-20));
  if(t<1.0)f0=mv(t,0.3,1.0,HOME[1],-40,2,14);else if(t<1.4){f0=idl(-40,t);f0.rot=-12*Math.sin(Math.PI*sg(t,1.0,1.4))}else if(t<3.6)f0=mv(t,1.5,3.6,-40,R-80,6,20);else if(t<4.4){var ru=sg(t,3.6,4.4);f0={dx:R-80+35*eo(ru),lift:16*Math.sin(Math.PI*ru),sx:1,sy:1,rot:360*eio(ru),fl:-1,m:false}}else if(t<5.4){f0=idl(R-45,t);f0.sy=0.9;f0.sx=1.06}else if(t<5.8)f0=mv(t,5.4,5.8,R-45,R-45,1,16);else f0=mv(t,5.9,7.8,R-45,HOME[1],4,16);
  if(t<1.3)m=idl(0,t);else if(t<3.4)m=mv(t,1.3,3.4,0,R,7,22);else if(t<4.5)m=idl(R,t,-1);else if(t<5.1){m=mv(t,4.5,5.1,R,R-8,1,14);m.fl=1}else if(t<5.9)m=idl(R-8,t,1);else m=mv(t,5.9,7.8,R-8,0,4,16);
  if(t>1.15&&once('tp'))bang(0);
  if(every('gg',t,1.5,3.4,0.5))note(t<2.5?0:R/2);
  if(t>3.75&&once('du')){for(i=0;i<4;i++)part(hx(R-70)-9,SC.my+S-20,(Math.random()-.5)*120,-30-Math.random()*40,40,800,DUST,0)}
  if(every('dz',t,4.4,5.3,0.3))twinkle(R-45);
  if(t>4.5&&once('wn'))bang(R);
  if(t>5.4&&once('hh')){heart(R-26);heart(R-26)}
  if(t<1.5)f1=idl(HOME[2],t);else if(t<3.8)f1=mv(t,1.5,3.8,HOME[2],-40,5,14);else if(t<5.9)f1=idl(-40,t);else f1=mv(t,5.9,7.8,-40,HOME[2],4,14);
 }else{ // nap: gather -> yawn -> sleep with Zzz -> wake '!' -> stretch -> home
  var slp=eio(sg(t,1.4,1.9))*(1-eio(sg(t,6.2,6.5))),br=0.03*Math.sin(t*2.4),yw=Math.sin(Math.PI*sg(t,0.9,1.4));
  var nap=function(a,ph){a.sx=1+0.1*slp+br*slp+0.04*yw;a.sy=1-0.16*slp-br*slp*Math.cos(ph)+0.08*yw;a.lift=a.lift*(1-slp);if(t>6.5&&t<7.0){var s3=Math.sin(Math.PI*sg(t,6.5,7.0));a.lift=26*s3;a.sy=1+0.12*s3;a.sx=1-0.06*s3}return a};
  f0=nap(t<1.0?mv(t,0,1.0,HOME[1],-58,2,12):t<7.0?idl(-58,t):mv(t,7.0,8.2,-58,HOME[1],2,14),0.7);m=nap(idl(0,t),0);f1=nap(t<1.0?mv(t,0,1.0,HOME[2],-116,2,12):t<7.0?idl(-116,t):mv(t,7.0,8.2,-116,HOME[2],2,14),1.4);
  if(every('z',t,2.0,6.0,0.7)){var w2=Math.floor((t-2)/0.7)%3;zz(w2===0?0:w2===1?-58:-116,w2===1)}
  if(t>6.25&&once('wk'))bang(0);if(t>6.6&&once('tw')){twinkle(-58);twinkle(0)}
 }
 A.push(m,f0,f1);return A}
function scStart(now,x,y){var W2=window.innerWidth-S;SC={k:SCN[sci%SCN.length],t0:now,mx:x,my:y,f:{},st:[],room:W2-x};sci++;
 SC.D=SC.k==='tag'||SC.k==='nap'?8.3:SC.k==='peek'?6.9:6.7;if(SC.k==='tag'&&SC.room<90)SC.k='hug';
 for(var i=0;i<FR.length;i++)SC.st.push(FR[i].x===undefined?x+HOME[i+1]:FR[i].x);clog.push('scene '+SC.k)}
function scPose(now){var t=(now-SC.t0)/1000;if(t>=SC.D){scEnd();return null}SC.t=t;try{SC.P=scene(t)}catch(e){scEnd();return null}return SC.P}

function hideBub(){vstop();try{bub.style.opacity='0';spk.style.display='none'}catch(e){}}
function reset(){mode=0;q=[];tg=null;trip=0;stay=0;talk=0;pause=0;nextI=30;lmv=+new Date();hideBub()}
function showBub(c0,jp){var c={x:c0.x,y:c0.y,w:c0.w,h:c0.h,mw:c0.mw,n:jp?c0.jn:c0.n,s:jp?c0.js:c0.s},fs=Math.max(22,Math.round(c.mw/60)),i,h='';bub.style.fontSize=fs+'px';
 for(i=0;i<c.s.length;i++)h+='<span>'+rbw(c.s[i],i*3)+'</span>';bub.className='';bub.innerHTML='<div class="gw"><div class="gl"></div></div>'+(c.n?'<b>'+rbw(c.n,0)+'</b>':'')+h+CS;var bh=bub.offsetHeight,bw=bub.offsetWidth,lx=Math.max(4,Math.min(c.x,window.innerWidth-bw-4)),ty=c.y-bh-6,cl='up';
 if(ty<4){ty=c.y+c.h+14;cl='dn'}bub.style.left=lx+'px';bub.style.top=ty+'px';void bub.offsetWidth;bub.className=cl+(jp?' flip':' pop');bub.style.opacity='1';
 var sx2=c.x+c.w*0.75,sy2=c.y+c.h*0.6;spk.style.left=sx2+'px';spk.style.top=sy2+'px';spk.style.display='block'}
function rbw(t,o){var r='',j,ch;for(j=0;j<t.length;j++){ch=t.charAt(j);if(ch===' '){r+=' ';continue}var d='-'+((j+o)*0.13%2.4).toFixed(2)+'s';r+='<em style="-webkit-animation-delay:'+d+','+(-j*0.09).toFixed(2)+'s;animation-delay:'+d+','+(-j*0.09).toFixed(2)+'s">'+ch+'</em>'}return r}
var fx=[],fxl=document.createElement('div'),FC=['#ff3b5c','#ff9f1c','#ffd60a','#2ec95c','#1fa8ff','#a05cff','#ff6fae'];fxl.id='cfx';
function star(c,z){return '<svg width="'+z+'" height="'+z+'" viewBox="0 0 24 24"><path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9Z" fill="'+c+'" stroke="#fff" stroke-width="1.5"/></svg>'}
function part(x,y,vx,vy,g,life,html,vr){if(fx.length>40)return;var e=document.createElement('b');e.innerHTML=html;fxl.appendChild(e);fx.push({e:e,x:x,y:y,vx:vx,vy:vy,g:g,t:+new Date(),l:life,r:0,vr:vr})}
function burst(x,y,n){var k2,a,sp2,c;for(k2=0;k2<n;k2++){a=-Math.PI*(0.1+0.8*Math.random());sp2=260+Math.random()*260;c=FC[k2%FC.length];
 part(x,y,Math.cos(a)*sp2,Math.sin(a)*sp2,700,1300+Math.random()*400,k2%3===0?star(c,18):'<i style="display:block;width:10px;height:14px;border-radius:2px;background:'+c+'"></i>',(Math.random()-.5)*900)}
 var rg=document.createElement('b');rg.className='rg';rg.style.width=rg.style.height='120px';rg.style.marginLeft=rg.style.marginTop='-65px';rg.style.webkitTransform='';fxl.appendChild(rg);rg.style.left=x+'px';rg.style.top=y+'px';fx.push({e:rg,t:+new Date(),l:850,css:1})}
function fxTick(){var nw=+new Date(),i2,p2,a2,tt;for(i2=fx.length-1;i2>=0;i2--){p2=fx[i2];a2=nw-p2.t;if(a2>=p2.l){if(p2.e.parentNode)p2.e.parentNode.removeChild(p2.e);fx.splice(i2,1);continue}if(p2.css)continue;tt=a2/1000;
 var tr2='translate3d('+(p2.x+p2.vx*tt).toFixed(1)+'px,'+(p2.y+p2.vy*tt+p2.g*tt*tt/2).toFixed(1)+'px,0) rotate('+(p2.vr*tt).toFixed(0)+'deg)';p2.e.style.webkitTransform=tr2;p2.e.style.transform=tr2;p2.e.style.opacity=(a2>p2.l*0.6?1-(a2-p2.l*0.6)/(p2.l*0.4):1).toFixed(2)}}
var CS='<i class="cs" style="left:-14px;top:-14px">'+star('#ffd84a',26)+'</i><i class="cs" style="right:-14px;top:-14px;-webkit-animation-delay:-.4s;animation-delay:-.4s">'+star('#7fe3ff',26)+'</i><i class="cs" style="left:-14px;bottom:-14px;-webkit-animation-delay:-.8s;animation-delay:-.8s">'+star('#ff8fd0',26)+'</i><i class="cs" style="right:-14px;bottom:-14px;-webkit-animation-delay:-1.2s;animation-delay:-1.2s">'+star('#b7ff6a',26)+'</i>';
var HT='<svg width="26" height="24" viewBox="0 0 26 24"><path d="M13 23 C-6 10 3-4 13 6 C23-4 32 10 13 23Z" fill="#ff5c9a" stroke="#fff" stroke-width="2"/></svg>',
 SK='<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9Z" fill="#ffd84a" stroke="#fff" stroke-width="1.5"/></svg>',
 SP=[[0,0,HT,0],[30,-20,SK,.45],[-26,-30,SK,.9],[14,-44,HT,1.3],[-8,8,SK,1.1]],sh='',si;
for(si=0;si<SP.length;si++)sh+='<i style="left:'+SP[si][0]+'px;top:'+SP[si][1]+'px;-webkit-animation-delay:'+SP[si][3]+'s;animation-delay:'+SP[si][3]+'s">'+SP[si][2]+'</i>';
spk.id='cspk';spk.innerHTML=sh;document.body.appendChild(spk);
(function(){if(/[?&]critters=1/.test(location.search))return;var ks=[],j,kk;for(j=1;ks.length<2&&j<12;j++){kk=A[(doy+j*2+(j>2?1:0))%A.length];if(kk!==k&&ks.indexOf(kk)<0)ks.push(kk)}
 for(j=0;j<ks.length;j++){var e=document.createElement('div');e.className='crf';e.innerHTML='<i>'+svg(ks[j],false)+'</i>';document.body.appendChild(e);FR.push({e:e,ie:e.firstChild,sv:e.firstChild.firstChild,k:ks[j],bl:0.85*(j+1),ph:Math.random(),lmv:+new Date(),lx:-1,ly:-1})}})();
bub.id='cbub';document.body.appendChild(bub);document.body.appendChild(fxl);raf(tick)}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
}catch(x){}})();
