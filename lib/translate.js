// Free translation, no key: Google dict endpoint, MyMemory fallback. Optional DEEPL_KEY could be added later.
const det=t=>/[\u3040-\u30ff]/.test(t)?'ja':/[\u4e00-\u9fff]/.test(t)?'zh':/[a-zA-Z]/.test(t)?'en':'';
const G={zh:'zh-CN',ja:'ja',en:'en'};
const norm=l=>l?(/^zh/.test(l)?'zh':/^ja/.test(l)?'ja':/^en/.test(l)?'en':l):'';
async function get(u,ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal});if(!r.ok)throw new Error(r.status);return await r.json()}finally{clearTimeout(t)}}
async function tr(text,to,from){
 from=norm(from)||det(text);if(from===to)return {text,from};
 try{const j=await get('https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl='+(from?G[from]||from:'auto')+'&tl='+G[to]+'&q='+encodeURIComponent(text),5000);
  const x=Array.isArray(j[0])?j[0]:[j[0]];if(x[0])return {text:String(x[0]),from:norm(x[1])||from}}catch(e){}
 try{const j=await get('https://api.mymemory.translated.net/get?langpair='+(G[from]||'ja')+'|'+G[to]+'&q='+encodeURIComponent(text),6000);
  if(j.responseStatus==200)return {text:j.responseData.translatedText,from}}catch(e){}
 return null}
module.exports={tr,det,norm};
