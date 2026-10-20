// node tools/gen_critter_voice.js  -> public/voice/critter/*.mp3 + manifest.json
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const {MsEdgeTTS,OUTPUT_FORMAT}=require('msedge-tts');
const src=fs.readFileSync(path.join(__dirname,'..','public','critter.js'),'utf8');
const PI=eval(src.match(/var PI=(\[[\s\S]*?\]\]);/)[1]);
const G=src.match(/var GEN=(\[[^\]]*\]),GJ=(\[[^\]]*\]);/);const GEN=eval(G[1]),GJ=eval(G[2]);
const V={zh:'zh-CN-XiaoxiaoNeural',ja:'ja-JP-NanamiNeural'},P={zh:{rate:'+5%',pitch:'+2%'},ja:{rate:'+5%',pitch:'+2%'}};
const out=path.join(__dirname,'..','public','voice','critter');fs.mkdirSync(out,{recursive:true});
const clean=s=>s.replace(/～(?=[^\s、，！]+)/g,'ー').replace(/～/g,'！').replace(/×/g,'と').replace(/！([，、])/g,'！');
async function tts(text,lang){for(let k=0;k<3;k++){const t=new MsEdgeTTS();try{await t.setMetadata(V[lang],OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
 const b=await new Promise((res,rej)=>{const {audioStream}=t.toStream(text,P[lang]);const c=[];audioStream.on('data',d=>c.push(d));audioStream.on('error',rej);audioStream.on('close',()=>res(Buffer.concat(c)))});
 if(b.length>1000)return b}catch(e){console.error('retry',lang,e.message)}finally{try{t.close()}catch(e){}}}throw new Error('tts failed '+text)}
const dur=f=>+(+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString()).toFixed(2);
(async()=>{const M={v:1,voice:V,zh:{},ja:{}};
 const jobs=[];PI.forEach((p,i)=>{jobs.push(['zh',p[1],[p[1]].concat(p.slice(2,5)),'p'+i+'_zh']);jobs.push(['ja',p[5],[p[5]].concat(p.slice(6,9)),'p'+i+'_ja'])});
 jobs.push(['zh','',GEN,'gen_zh']);jobs.push(['ja','',GJ,'gen_ja']);
 for(const [lang,key,parts,name] of jobs){const txt=clean(parts.join(lang==='zh'?'，':'、'));const f=path.join(out,name+'.mp3');
  fs.writeFileSync(f,await tts(txt,lang));M[lang][key]={f:name+'.mp3',d:dur(f)};console.log(name,M[lang][key].d,txt)}
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(M));})();
