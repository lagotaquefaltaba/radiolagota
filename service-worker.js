// Service Worker La Gota - SIN Firebase. Solo cache + push desde tu VPS (AzuraCast aparte).
const CACHE='lagota-v2';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return; if(e.request.url.includes(':8000'))return; e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){d={body:e.data?e.data.text():'La Gota'}}; e.waitUntil(self.registration.showNotification(d.title||'La Gota 107.5 FM',{body:d.body||'Estamos en vivo',icon:'./icon-192.png',badge:'./icon-192.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close(); e.waitUntil(clients.openWindow((e.notification.data&&e.notification.data.url)||'./'))});
