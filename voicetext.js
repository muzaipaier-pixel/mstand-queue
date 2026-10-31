// Builds per-language announcement text: customer name (auto-transliterated) + drink names / cup count.
const wanakana=require('wanakana');
const {pinyin}=require('pinyin-pro');
const t2s=require('opencc-js').Converter({from:'tw',to:'cn'});
// Square item name (JP) -> {ja (reading-friendly), zh, en}
const MENU={
 'Mixベリースムージー':{ja:'ミックスベリースムージー',zh:'混合莓果冰沙',en:'Mixed Berry Smoothie'},
 'Mixベリーミルク':{ja:'ミックスベリーミルク',zh:'混合莓果牛奶',en:'Mixed Berry Milk'},
 'たっぷりいちごミルク':{ja:'たっぷりいちごミルク',zh:'满满草莓牛奶',en:'Strawberry Milk'},
 'たっぷりドラゴンミルク':{ja:'たっぷりドラゴンミルク',zh:'满满火龙果牛奶',en:'Dragon Fruit Milk'},
 'たっぷりマンゴーミルク':{ja:'たっぷりマンゴーミルク',zh:'满满芒果牛奶',en:'Mango Milk'},
 'もちもち抹茶ミルク':{ja:'もちもち抹茶ミルク',zh:'麻薯抹茶牛奶',en:'Mochi Matcha Milk'},
 'アボカドスムージー':{ja:'アボカドスムージー',zh:'牛油果冰沙',en:'Avocado Smoothie'},
 'ココナッツミルクスムージー':{ja:'ココナッツミルクスムージー',zh:'椰奶冰沙',en:'Coconut Milk Smoothie'},
 'タロ芋ミルクスムージー':{ja:'タロイモミルクスムージー',zh:'芋头牛奶冰沙',en:'Taro Milk Smoothie'},
 'チーズクリームジャスミン':{ja:'チーズクリームジャスミン',zh:'芝士奶盖茉莉',en:'Cheese Foam Jasmine Tea'},
 'チーズクリーム四季春':{ja:'チーズクリーム四季春',zh:'芝士奶盖四季春',en:'Cheese Foam Four Seasons Tea'},
 'チーズクリーム宇治抹茶':{ja:'チーズクリーム宇治抹茶',zh:'芝士奶盖宇治抹茶',en:'Cheese Foam Uji Matcha'},
 'ハイビスカスティー':{ja:'ハイビスカスティー',zh:'洛神花茶',en:'Hibiscus Tea'},
 'ブルーベリースムージー':{ja:'ブルーベリースムージー',zh:'蓝莓冰沙',en:'Blueberry Smoothie'},
 'ロイヤルタピオカミルクティー':{ja:'ロイヤルタピオカミルクティー',zh:'皇家珍珠奶茶',en:'Royal Bubble Milk Tea'},
 '上品四季春':{ja:'上品四季春',zh:'上品四季春',en:'Four Seasons Oolong Tea'},
 '台湾トウガン茶':{ja:'台湾トウガン茶',zh:'台湾冬瓜茶',en:'Taiwanese Winter Melon Tea'},
 '朝露ジャスミン':{ja:'あさつゆジャスミン',zh:'朝露茉莉',en:'Morning Dew Jasmine Tea'},
 '柚子ハニーオレンジ':{ja:'ゆずハニーオレンジ',zh:'柚子蜂蜜橙',en:'Yuzu Honey Orange'},
 '楊枝甘露':{ja:'ヤンジーガンルー',zh:'杨枝甘露',en:'Mango Pomelo Sago'},
 '海塩パイナップルスムージー':{ja:'海塩パイナップルスムージー',zh:'海盐菠萝冰沙',en:'Sea Salt Pineapple Smoothie'},
 '満杯いちごスムージー':{ja:'満杯いちごスムージー',zh:'满杯草莓冰沙',en:'Strawberry Smoothie'},
 '満杯チェリースムージー':{ja:'満杯チェリースムージー',zh:'满杯樱桃冰沙',en:'Cherry Smoothie'},
 '満杯ドラゴンフルーツ':{ja:'満杯ドラゴンフルーツ',zh:'满杯火龙果',en:'Dragon Fruit Drink'},
 '満杯パッションフルーツ':{ja:'満杯パッションフルーツ',zh:'满杯百香果',en:'Passion Fruit Drink'},
 '爆ライム四季春':{ja:'爆ライム四季春',zh:'爆柠四季春',en:'Lime Four Seasons Tea'},
 '黒糖BOBOミルク':{ja:'黒糖ボボミルク',zh:'黑糖波波牛奶',en:'Brown Sugar Boba Milk'},
};
const norm=s=>String(s||'').normalize('NFKC').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'').replace(/[（(\[【].*?[）)\]】]/g,'').replace(/\b(S|M|L|HOT|ICE)\b/gi,'').replace(/\s+/g,'').toLowerCase();
const IDX=Object.entries(MENU).map(([k,v])=>[norm(k),v]);
function drink(name){
 const n=norm(name);if(!n)return null;
 let hit=IDX.find(([k])=>k===n)||IDX.filter(([k])=>n.includes(k)||k.includes(n)).sort((a,b)=>b[0].length-a[0].length)[0];
 if(hit)return hit[1];
 const raw=String(name).replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'').trim();
 return {ja:raw,zh:t2s(raw),en:/^[\x20-\x7e]+$/.test(raw)?raw:''};
}
const cap=s=>s.replace(/(^|\s)([a-z])/g,(m,a,b)=>a+b.toUpperCase());
const hasKana=s=>/[\u3040-\u30ff]/.test(s),hasHan=s=>/[\u3400-\u9fff]/.test(s);
function romaji(s){return cap(wanakana.toRomaji(s.replace(/[・･]/g,' ')).replace(/[^A-Za-z ]/g,'').replace(/\s+/g,' ').trim())}
function hanziEn(s){ // pinyin best effort; 2-4 char name: surname + given joined
 const p=pinyin(t2s(s),{toneType:'none',type:'array',surname:'head'}).filter(x=>/^[a-zü]+$/i.test(x)).map(x=>x.replace('ü','u'));
 if(!p.length)return '';if(p.length<=4&&p.length>=2)return cap(p[0]+' '+p.slice(1).join(''));return cap(p.join(' '));
}
function names(n){
 n=String(n||'').replace(/[<>&"'`\\]/g,'').trim().slice(0,24);
 if(/^[0-9]+$/.test(n))return {num:String(parseInt(n,10))};
 let en='';
 if(/^[A-Za-z][A-Za-z .'-]*$/.test(n))en=n;
 else if(hasKana(n)&&!hasHan(n))en=romaji(n);
 else if(hasHan(n)&&!hasKana(n))en=hanziEn(n);
 else en=romaji(n.replace(/[\u3400-\u9fff]+/g,m=>' '+hanziEn(m)+' '));
 let zh;
 if(hasKana(n))zh=en; // katakana name: read romanized
 else zh=t2s(n).replace(/\s+/g,'');
 return {ja:n,zh,en};
}
// items: [{n:name,q:qty}]
function parseItems(s){return String(s||'').split('|').map(x=>{const m=/^(.*)\*(\d+)$/.exec(x);return m?{n:m[1],q:+m[2]}:{n:x,q:1}}).filter(x=>x.n).slice(0,10)}
const CNUM=['零','一','两','三','四','五','六','七','八','九','十'];
function phrase(n,lang,items){
 const nm=names(n);items=items||[];
 const cups=items.reduce((a,b)=>a+(b.q||1),0);
 const list=[];if(cups&&cups<=2)items.forEach(it=>{const d=drink(it.n),g=list.find(x=>x.d.ja===d.ja);if(g)g.q+=(it.q||1);else list.push({d,q:it.q||1})});
 if(lang==='zh'){
  const who=nm.num?nm.num+'号宝宝':(nm.zh?nm.zh+'宝宝':'宝宝');
  const what=list.length?'你的'+list.map(x=>(x.q>1?(CNUM[x.q]||x.q)+'杯':'')+x.d.zh).join('和')+'做好啦':cups>2?'你的'+(CNUM[cups]||cups)+'杯饮品做好啦':'你的饮品做好啦';
  return who+'，'+what+'，请取餐';
 }
 if(lang==='en'){
  const who=nm.num?'Number '+nm.num:nm.en;
  const ds=list.map(x=>x.d.en?(x.q>1?'two '+x.d.en+'s':x.d.en):'').filter(Boolean);
  const what=ds.length===list.length&&ds.length?'your '+ds.join(' and ')+(ds.length>1||list.some(x=>x.q>1)?' are':' is')+' ready':cups>2?'your '+cups+' drinks are ready':'your order is ready';
  return who?who+', '+what:what.charAt(0).toUpperCase()+what.slice(1);
 }
 const who=nm.num?nm.num+'番のお客さま':nm.ja+(/[A-Za-z]$/.test(nm.ja)?' さま':'さま');
 const what=list.length?list.map(x=>x.d.ja+(x.q>1?' '+x.q+'杯':'')).join('と')+'、':cups>2?'ドリンク'+cups+'点、':'';
 return who+'、'+what+'お待たせしました';
}
// new-order thank-you (screen only). Numeric/empty label -> no-name version
function thanks(n,lang){
 const nm=names(n);const has=!nm.num&&nm.ja;
 if(lang==='zh')return has&&nm.zh?'谢谢'+nm.zh+'宝宝下单～':'谢谢宝宝下单～';
 if(lang==='en')return has&&nm.en?'Thank you for your order, '+nm.en:'Thank you for your order';
 return has?nm.ja+(/[A-Za-z]$/.test(nm.ja)?' さま':'さま')+'、ご注文ありがとうございます':'ご注文ありがとうございます';
}
// long lines (drink names) are spoken a bit faster to keep 3 languages within ~15s
// Japanese: Nanami slightly slower and lower than default -> warmer, calmer, less shrill (v13). zh/en unchanged.
const JA_VOICE_V=2;
function prosody(t,lang){if(lang!=='ja')return {rate:rateFor(t,lang)};const L=t.length;return {rate:L>26?'+6%':L>18?'+2%':'-4%',pitch:'-4%'}}
function rateFor(t,lang){const L=lang==='en'?t.length/2.2:t.length;return L>26?'+15%':L>18?'+8%':'+0%'}
// fun extras appended to the call line: bday | ms<N> (today's Nth cup) | life<N> | reg<N> (Nth visit)
function parseFx(q){const fx={};String(q||'').split(',').slice(0,4).forEach(x=>{if(x==='bday')fx.bday=1;let m=/^(ms|life|reg)(\d{1,6})$/.exec(x);if(m)fx[m[1]]=+m[2]});return fx}
const fxKey=fx=>Object.keys(fx).sort().map(k=>k+fx[k]).join(',');
function withFx(text,lang,fx){
 if(!fx)return text;const add=[];
 if(fx.bday)add.push(lang==='zh'?'祝你生日快乐！':lang==='en'?'Happy birthday!':'お誕生日おめでとうございます！');
 if(fx.life)add.push(lang==='zh'?'这是本店第'+fx.life+'杯，恭喜你！':lang==='en'?'This is our '+fx.life+'th cup ever, congratulations!':'当店通算'+fx.life+'杯目、おめでとうございます！');
 if(fx.ms)add.push(lang==='zh'?'这是今天第'+fx.ms+'杯，恭喜你！':lang==='en'?"You got today's "+fx.ms+'th cup, congratulations!':'本日'+fx.ms+'杯目、おめでとうございます！');
 if(fx.reg)add.push(lang==='zh'?'谢谢你一直以来的支持！':lang==='en'?'Thank you for always coming!':'いつもありがとうございます！');
 return add.length?text+'。'.replace('。',lang==='en'?'. ':'。')+add.join(lang==='en'?' ':''):text;
}
module.exports={prosody,JA_VOICE_V,parseFx,fxKey,withFx,thanks,rateFor,phrase,parseItems,names,drink,MENU};
