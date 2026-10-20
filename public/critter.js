/* Daily cute animal running around the screen edge. ES5, transform-only. */
(function(){try{
var A=['\uD83D\uDC31','\uD83D\uDC36','\uD83D\uDC30','\uD83D\uDC39','\uD83D\uDC3C','\uD83D\uDC27','\uD83E\uDD8A','\uD83D\uDC28','\uD83D\uDC25','\uD83D\uDC3B','\uD83D\uDC22','\uD83E\uDD94'];
var d=new Date(),M=d.getMonth()+1,D=d.getDate(),doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);
var qs=location.search,m=/[?&]critter=(\d+)/.exec(qs);
var e=A[doy%A.length];
if(M===10&&D>=20)e=(doy%2)?'\uD83D\uDC08':'\uD83E\uDD87';
if(m)e=A[(+m[1])%A.length];
var st=document.createElement('style');
st.textContent='#critter{position:fixed;left:0;top:0;z-index:9000;pointer-events:none;will-change:transform;-webkit-transform:translate3d(-99px,0,0);transform:translate3d(-99px,0,0)}'+
'#critter i{display:block;font-style:normal;font-size:52px;line-height:56px;width:56px;text-align:center;-webkit-transform-origin:50% 90%;transform-origin:50% 90%;will-change:transform}';
document.getElementsByTagName('head')[0].appendChild(st);
var w=document.createElement('div');w.id='critter';w.innerHTML='<i>'+e+'</i>';
function start(){document.body.appendChild(w);var ie=w.firstChild;
var S=56,fz=/[?&]critterpos=([\d.]+)/.exec(location.search),seg=0,sp=0,pause=0,last=0,ph=0,
raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){return setTimeout(function(){f(+new Date())},33)};
function tick(t){var W=window.innerWidth-S,H=window.innerHeight-S,L=[W,H,W,H],dt=last?Math.min(t-last,100)/1000:0;last=t;
 var len=L[seg],v=len>=Math.max(W,H)?90:62;
 if(fz){var P=2*(W+H),q=(+fz[1])*P;seg=0;while(q>L[seg]&&seg<3){q-=L[seg];seg++}sp=q;pause=0;dt=0;len=L[seg];var fp=/[?&]critterph=([\d.]+)/.exec(location.search);ph=fp?+fp[1]:0}
 if(pause>0){pause-=dt}else{sp+=v*dt;ph+=dt/0.34;if(sp>=len){sp=0;seg=(seg+1)%4;pause=0.3;len=L[seg]}}
 var x,y,r,p=sp; /* emoji faces left: scaleX(-1) faces travel dir, then rotate so feet touch the edge */
 if(seg===0){x=p;y=H;r=0}else if(seg===1){x=W;y=H-p;r=-90}else if(seg===2){x=W-p;y=0;r=180}else{x=0;y=p;r=90}
 var tr='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r+'deg) scaleX(-1)';
 w.style.webkitTransform=tr;w.style.transform=tr;
 /* run cycle (local frame: up=-Y, forward=-X before the flip) */
 var f=ph-Math.floor(ph),by=0,sx=1,sy=1,lean=0;
 if(pause>0){f=0;var k=pause/0.3;sx=1+0.06*k;sy=1-0.06*k;lean=4*k}
 else if(f<0.7){var a=f/0.7,h=Math.sin(Math.PI*a);by=-10*h;sy=1+0.08*h;sx=1-0.06*h;lean=-8-4*Math.cos(Math.PI*a)}
 else{var c=Math.sin(Math.PI*(f-0.7)/0.3);sy=1-0.14*c;sx=1+0.12*c;lean=-6}
 var it='translate3d(0,'+by.toFixed(1)+'px,0) rotate('+lean.toFixed(1)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
 ie.style.webkitTransform=it;ie.style.transform=it;raf(tick)}
raf(tick)}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
}catch(x){}})();
