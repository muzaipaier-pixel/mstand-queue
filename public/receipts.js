// 📷 拍单据 widget. Uses global PIN (set by host page). Mount: <div id="rcpt"></div><script src="/receipts.js"></script>
(function(){
var box=document.getElementById('rcpt');if(!box)return;
box.innerHTML='<div style="margin:12px 0;padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff">'+
'<label style="display:block;text-align:center;padding:16px;font-size:20px;font-weight:700;background:#ff8a00;color:#fff;border-radius:12px;cursor:pointer">📷 拍单据'+
'<input id="rcF" type="file" accept="image/*" capture="environment" multiple style="display:none"></label>'+
'<input id="rcN" placeholder="备注（可选，如供应商）" style="width:100%;box-sizing:border-box;margin-top:8px;padding:10px;font-size:16px;border:1px solid #ccc;border-radius:8px">'+
'<div id="rcM" style="margin:6px 0;color:#666;font-size:14px"></div><div id="rcL"></div></div>';
function pin(){return window.PIN||''}
function $(i){return document.getElementById(i)}
function shrink(f,cb){var url=URL.createObjectURL(f),im=new Image();im.onload=function(){var M=1600,w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,M/Math.max(w,h));
 var c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);
 c.toBlob(function(b){cb(b)},'image/jpeg',0.8)};im.onerror=function(){URL.revokeObjectURL(url);cb(null)};im.src=url}
function up(files,i,ok){if(i>=files.length){$('rcM').textContent='上传完成 '+ok+'/'+files.length+' 张，等待识别';$('rcF').value='';list();return}
 var f=files[i];if(f.size>10*1024*1024){$('rcM').textContent='第'+(i+1)+'张超过 10MB，跳过';return up(files,i+1,ok)}
 $('rcM').textContent='上传中 '+(i+1)+'/'+files.length+'…';
 shrink(f,function(b){if(!b){$('rcM').textContent='第'+(i+1)+'张无法读取';return up(files,i+1,ok)}
  var x=new XMLHttpRequest();x.open('POST','/api/receipts',true);x.setRequestHeader('Content-Type','image/jpeg');x.setRequestHeader('x-pin',pin());
  x.setRequestHeader('x-note',encodeURIComponent($('rcN').value||''));x.timeout=60000;
  x.onload=function(){up(files,i+1,ok+(x.status===200?1:0))};x.onerror=x.ontimeout=function(){up(files,i+1,ok)};x.send(b)})}
$('rcF').onchange=function(){var fs=[].slice.call(this.files||[]);if(fs.length)up(fs,0,0)};
var COL={'待识别':'#ff8a00','已录入':'#2a9d4b','需确认':'#d33'};
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function list(){if(!pin())return;var x=new XMLHttpRequest();x.open('GET','/api/receipts',true);x.setRequestHeader('x-pin',pin());
 x.onload=function(){if(x.status!==200)return;var d=JSON.parse(x.responseText),h='';
  d.items.slice(0,30).forEach(function(it){var t=new Date(it.uploadedAt).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
   h+='<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-top:1px solid #eee">'+(it.file?'<img data-id="'+it.id+'" style="width:56px;height:56px;object-fit:cover;border-radius:6px;background:#eee">':'<div style="width:56px;height:56px;background:#eee;border-radius:6px"></div>')+
   '<div style="flex:1;font-size:14px"><b style="color:'+(COL[it.status]||'#333')+'">'+esc(it.status)+'</b> · '+t+(it.note?' · '+esc(it.note):'')+(it.result?'<div style="color:#555">'+esc(it.result)+'</div>':'')+'</div></div>'});
  $('rcL').innerHTML=h||'<div style="color:#999;font-size:14px">还没有上传的单据</div>';
  [].forEach.call($('rcL').querySelectorAll('img[data-id]'),function(im){var y=new XMLHttpRequest();y.open('GET','/api/receipts/'+im.getAttribute('data-id')+'/image',true);y.responseType='blob';y.setRequestHeader('x-pin',pin());
   y.onload=function(){if(y.status===200){var u=URL.createObjectURL(y.response);im.src=u;im.onclick=function(){window.open(u)}}};y.send()})};x.send()}
window.rcptList=list;list();setInterval(function(){if(!document.hidden)list()},60000);
})();
