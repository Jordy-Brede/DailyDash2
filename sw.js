
const CACHE_NAME = 'daily-dash-v1';
const OFFLINE_URL = 'offline.html';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  // Materialize assets via CDN may not be cached unless requested — we include CDN urls:
  //'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
 // 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
  // sample image to cache
  //'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=60'
];

self.addEventListener('install', event => {
  console.log('[sw] install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.concat([OFFLINE_URL]).map(url => new Request(url, {mode: 'no-cors'})))
        .catch(err => {
          
          return caches.open(CACHE_NAME).then(cache2 => cache2.addAll([ '/', '/index.html', '/styles.css', '/app.js', '/manifest.json', OFFLINE_URL ]));
        });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[sw] activate');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(resp => {
   
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resp.clone());
          return resp;
        });
      }).catch(err => {
        return caches.match('/index.html').then(res => res || caches.match(OFFLINE_URL));
      })
    );
    return;
  }


  event.respondWith(
    caches.match(event.request).then(cacheResp => {
      if (cacheResp) return cacheResp;
      return fetch(event.request).then(netResp => {
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(event.request, netResp.clone()); } catch(e) {}
          return netResp;
        });
      }).catch(err => {
       
        return caches.match(OFFLINE_URL);
      });
    })
  );
});
