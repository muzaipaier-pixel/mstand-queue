// 豊島区 area 149870 garbage rules (source: official delight-system calendar, Oct 2026 pattern)
(function(){
var T={burn:{zh:'可燃垃圾',ja:'燃やすごみ',ic:'🔥',c:'#ff6b3d'},
bin:{zh:'瓶·罐·塑料瓶',ja:'資源（びん・かん・ペットボトル）',ic:'🍾',c:'#2f9bff'},
paper:{zh:'纸箱·纸类·布类',ja:'資源（段ボール・紙・布類）',ic:'📦',c:'#b07a3c'},
pla:{zh:'塑料',ja:'資源（プラスチック）',ic:'♻️',c:'#2fb36b'},
metal:{zh:'金属·陶器·玻璃',ja:'金属・陶器・ガラスごみ',ic:'🔩',c:'#8a6cff'}};
function md(d){return (d.getMonth()+1)*100+d.getDate()}
function get(d){var m=md(d);
 if(m>=1231||m<=103)return {off:true,items:[]}; // 年末年始停收（具体以官网为准）
 var w=d.getDay(),n=Math.ceil(d.getDate()/7),a=[];
 if(w==1||w==4)a.push('burn'); if(w==2)a.push('bin'); if(w==3)a.push('paper','pla');
 if(w==5&&(n==1||n==3))a.push('metal');
 return {off:false,items:a.map(function(k){return T[k]})};}
window.Garbage={types:T,get:get,time:'早上8点前拿出去（朝8時まで）',
 url:'https://manage.delight-system.com/threeR/web/calendar?menu=calendar&jichitaiId=toshimaku&areaId=149870&areaName=%2F&lang=ja&benriCateId=%2F&bunbetsuCateId=%2F&faqCateId=%2F&howToCateId='};
})();
