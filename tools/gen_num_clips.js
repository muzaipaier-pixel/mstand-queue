// Pre-record number-only call clips (ja,zh,en joined with gap.mp3) -> public/voice/num/v1/<n>.mp3
// usage: node tools/gen_num_clips.js 1 300
const fs=require('fs'),path=require('path');const {MsEdgeTTS,OUTPUT_FORMAT}=require('msedge-tts');const VT=require('../voicetext');
const VOICES={ja:'ja-JP-NanamiNeural',zh:'zh-CN-XiaoxiaoNeural',en:'en-US-JennyNeural'},LANGS=['ja','zh','en'];
const OUT=path.join(__dirname,'..','public','voice','num','v1'),GAP=fs.readFileSync(path.join(__dirname,'..','public','gap.mp3'));
const a=+process.argv[2]||1,z=+process.argv[3]||300;
async function tts(text,lang){for(let t=0;t<4;t++){const x=new MsEdgeTTS();try{await x.setMetadata(VOICES[lang],OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
 const b=await new Promise((res,rej)=>{const {audioStream}=x.toStream(text,{rate:VT.rateFor(text,lang)});const c=[];audioStream.on('data',d=>c.push(d));audioStream.on('error',rej);audioStream.on('close',()=>res(Buffer.concat(c)))});
 if(b.length>1000)return b}catch(e){}finally{try{x.close()}catch(e){}}await new Promise(r=>setTimeout(r,1500))}throw new Error('tts fail '+text)}
(async()=>{let n=a;const work=async()=>{while(n<=z){const i=n++;const f=path.join(OUT,i+'.mp3');if(fs.existsSync(f))continue;
 const parts=[];for(const l of LANGS){parts.push(await tts(VT.phrase(String(i),l,[]),l))}
 const out=[];parts.forEach((p,k)=>{if(k)out.push(GAP);out.push(p)});fs.writeFileSync(f,Buffer.concat(out))}};
 await Promise.all([1,2,3,4].map(work));
 let bytes=0;for(let i=a;i<=z;i++)bytes+=fs.statSync(path.join(OUT,i+'.mp3')).size;
 fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify({v:1,min:a,max:z,langs:'ja,zh,en',bytes}));console.log('done',bytes)})().catch(e=>{console.error(e);process.exit(1)});
