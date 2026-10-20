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
'#critter i{display:block;font-style:normal;font-size:52px;line-height:56px;width:56px;text-align:center;-webkit-animation:crHop .36s ease-in-out infinite alternate;animation:crHop .36s ease-in-out infinite alternate}'+
'@-webkit-keyframes crHop{from{-webkit-transform:translateY(0) rotate(-6deg)}to{-webkit-transform:translateY(-9px) rotate(6deg)}}'+
'@keyframes crHop{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-9px) rotate(6deg)}}';
document.getElementsByTagName('head')[0].appendChild(st);
var w=document.createElement('div');w.id='critter';w.innerHTML='<i>'+e+'</i>';
function start(){document.body.appendChild(w);
var S=56,fz=/[?&]critterpos=([\d.]+)/.exec(location.search),pos=0,last=0,speed=70,raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){return setTimeout(function(){f(+new Date())},33)};
function tick(t){var W=window.innerWidth-S,H=window.innerHeight-S,P=2*(W+H);
 if(last){var dt=Math.min(t-last,100);pos=(pos+speed*dt/1000)%P}last=t;if(fz)pos=(+fz[1])*P;
 var x,y,r,p=pos; /* emoji faces left: scaleX(-1) faces travel dir, then rotate so feet touch the edge */
 if(p<W){x=p;y=H;r=0}else if((p-=W)<H){x=W;y=H-p;r=-90}else if((p-=H)<W){x=W-p;y=0;r=180}else{p-=W;x=0;y=p;r=90}
 var tr='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r+'deg) scaleX(-1)';
 w.style.webkitTransform=tr;w.style.transform=tr;raf(tick)}
raf(tick)}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
}catch(x){}})();
