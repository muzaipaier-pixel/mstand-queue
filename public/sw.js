/* audio cache (ES5): cache-first for immutable/versioned audio; full 200 fetch even for media Range requests */
var C='mstand-audio-v1';
self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('mstand-audio-')===0&&k!==C}).map(function(k){return caches['delete'](k)}))}).then(function(){return self.clients.claim()}))});
function audioUrl(u){return /\/voice\/num\/v\d+\/\d+\.mp3$/.test(u.pathname)||/\/voice\/critter\/[^\/]+\.mp3$/.test(u.pathname)||/^\/vc\/[0-9a-f]{20}\.mp3$/.test(u.pathname)||(/^\/(chime_marimba\.mp3|chime\.wav|gap\.mp3)$/.test(u.pathname)&&u.search.indexOf('v=')>=0)}
var vcN=0;
function trimVc(c){c.keys().then(function(ks){var v=ks.filter(function(r){return r.url.indexOf('/vc/')>=0});if(v.length>200)for(var i=0;i<v.length-150;i++)c['delete'](v[i])})}
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);if(u.origin!==self.location.origin||!audioUrl(u))return;
 var key=u.pathname+u.search;
 e.respondWith(caches.open(C).then(function(c){return c.match(key).then(function(hit){if(hit)return hit;
  return fetch(key,{credentials:'same-origin'}).then(function(res){if(res&&res.status===200&&!/no-store/.test(res.headers.get('Cache-Control')||'')){c.put(key,res.clone());if(u.pathname.indexOf('/vc/')===0&&(++vcN%20===0))trimVc(c)}return res})})})['catch'](function(){return fetch(r)}))});
