/* approximate calories (standard sweetness, default ice, toppings excluded unless built-in). source: /workspace/calories/estimates.csv */
var KCAL=[
 {re:/^ロイヤルタピオカミルクティー/,m:380,l:490},
 {re:/マンゴーミルク/,m:300,l:400},
 {re:/^上品四季春/,m:110,l:150},
 {re:/朝露ジャスミン/,m:110,l:150},
 {re:/ハイビスカス/,m:120,l:160},
 {re:/トウガン/,m:150,l:200},
 {re:/黒糖/,m:470,l:610},
 {re:/抹茶ミルク/,m:300,l:400},
 {re:/チェリー/,m:240},
 {re:/アボカド/,m:450},
 {re:/いちごミルク|イチゴミルク/,m:260,l:340},
 {re:/柚子|ゆず/,m:250},
 {re:/楊枝甘露|ヤンジー|杨枝甘露/,m:360},
 {re:/爆ライム/,m:200},
 {re:/パッション/,m:190},
 {re:/チーズクリームジャスミン/,m:180,l:240},
 {re:/チーズクリーム四季春/,m:180,l:240},
 {re:/チーズクリーム宇治抹茶/,m:240,l:310},
 {re:/満杯ドラゴンフルーツ/,m:310},
 {re:/ココナッツ/,m:330},
 {re:/満杯いちごスムージー/,m:160},
 {re:/ドラゴンミルク/,m:280,l:370},
 {re:/Mixベリーミルク|ミックスベリーミルク/,m:270,l:370},
 {re:/ブルーベリー/,m:180},
 {re:/Mixベリースムージー/,m:180},
 {re:/パイナップル/,m:190},
 {re:/タロ芋/,m:410}
];
var TPKCAL=[{re:/^タピオカ/,k:150},{re:/寒天/,k:40},{re:/ナタデココ|椰果/,k:50},{re:/チーズクリーム|芝士/,k:120},{re:/ミニタピオカ|西米/,k:120}];
var KCAL_NOTE='カロリーは標準甘さの目安です。甘さを下げるとカロリーも下がります。';
function kcalOf(name){name=String(name||'');for(var i=0;i<KCAL.length;i++)if(KCAL[i].re.test(name))return KCAL[i];return null}
function kcalTop(name){name=String(name||'');for(var i=0;i<TPKCAL.length;i++)if(TPKCAL[i].re.test(name))return TPKCAL[i].k;return null}
function kcalTxt(k){if(!k)return '';return k.l?'約'+k.m+'/'+k.l+'kcal(M/L)':'約'+k.m+'kcal'}
function kcalLow(k){return !!(k&&k.m<=160)}
