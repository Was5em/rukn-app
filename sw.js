const CACHE_NAME = 'rukn-kids-v7';
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
    './privacy.html',
    './audio/adhan.mp3',
    './audio/dua_0.mp3',
    './audio/dua_1.mp4',
    './audio/dua_2.mp3',
    './audio/dua_4.mp3',
    './audio/dua_5.mp3',
    './audio/dua_6.mp3',
    './audio/dua_7.mp3',
    './audio/dua_8.mp3',
    './audio/dua_9.mp3',
    './audio/good_0.mp3',
    './audio/good_1.mp3',
    './audio/good_2.mp3',
    './audio/ramadan.mp3',
    './audio/ruqyah.mp3',
    './audio/story_0.mp3',
    './audio/story_1.mp3',
    './audio/story_2.mp3',
    './audio/story_3.mp3',
    './audio/story_4.mp3',
    './audio/story_5.mp3',
    './audio/story_6.mp3',
    './audio/story_7.mp3',
    './audio/yaseen.mp3'
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
    if (e.request.method !== 'GET') return;
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