const CACHE = 'lafina-pro-v5.0';
const SHELL = ['./', './index.html', './css/app.css', './js/app.js', './manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isCDN = ['googleapis.com','gstatic.com','jsdelivr.net','cloudflare.com'].some(d => url.hostname.includes(d));
  if (isCDN || url.origin === self.location.origin) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => null);
      return cached || fresh;
    })));
  }
});
