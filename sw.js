// Vardaan's Blockland service worker: makes the game work offline.
// Change V whenever you upload a new index.html so phones and laptops pick up the update.
const V='blockland-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-32.png','icon-180.png','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{ const c=res.clone(); caches.open(V).then(k=>k.put('index.html',c)); return res; }).catch(()=>caches.match('index.html')));
    return;
  }
  if(u.origin===location.origin){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ const c=res.clone(); caches.open(V).then(k=>k.put(r,c)); return res; })));
    return;
  }
  // fonts and other outside files: use the saved copy if there is one, refresh in background
  e.respondWith(caches.match(r).then(m=>{
    const f=fetch(r).then(res=>{ if(res&&(res.ok||res.type==='opaque')){ const c=res.clone(); caches.open(V).then(k=>k.put(r,c)); } return res; }).catch(()=>m);
    return m||f;
  }));
});
