const CACHE_NAME = 'rukn-kids-v6';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data.json',
    './icon_512.png',
    './icon_192.png',
    './mascot.png',
    './offline.html',
    './privacy.html'
];
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request).then(res => {
                if(res) return res;
                if(e.request.mode === 'navigate') return caches.match('./offline.html');
                return new Response('', {status: 404});
            }))
    );
});