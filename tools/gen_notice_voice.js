// node tools/gen_notice_voice.js -> public/voice/notice/*.mp3 + manifest.json (critter chat + order thanks + pickup bye)
// zh: Xiaoxiao (+5%/+2%), ja: Nanami v13 settings (-4%/-4%)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');const {MsEdgeTTS,OUTPUT_FORMAT}=require('msedge-tts');
const V={zh:'zh-CN-XiaoxiaoNeural',ja:'ja-JP-NanamiNeural'},P={zh:{rate:'+5%',pitch:'+2%'},ja:{rate:'-4%',pitch:'-4%'}};
const L=require('../public/notice_lines.json');
const out=path.join(__dirname,'..','public','voice','notice');fs.mkdirSync(out,{recursive:true});
async function tts(text,lang){for(let k=0;k<3;k++){const t=new MsEdgeTTS();try{await t.setMetadata(V[lang],OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
 const b=await new Promise((res,rej)=>{const {audioStream}=t.toStream(text,P[lang]);const c=[];audioStream.on('data',d=>c.push(d));audioStream.on('error',rej);audioStream.on('close',()=>res(Buffer.concat(c)))});if(b.length>1000)return b}catch(e){console.error('retry',e.message)}finally{try{t.close()}catch(e){}}}throw new Error('tts '+text)}
const dur=f=>+(+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString()).toFixed(2);
(async()=>{const M={v:1};for(const id of Object.keys(L)){M[id]={};for(const lang of ['zh','ja']){const f=id+'_'+lang+'.mp3';fs.writeFileSync(path.join(out,f),await tts(L[id][lang],lang));M[id][lang]={f,d:dur(path.join(out,f))};console.log(f,M[id][lang].d)}}
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(M))})();
