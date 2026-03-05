const CACHE_NAME = 'amem-ungidos-v2.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/public/styles/global.css',
    '/public/scripts/quiz.js',
    '/public/scripts/supabase_client.js',
    '/assets/logo-ungidos.png',
    '/public/assets/kids_journey_bg.png',
    '/stitch/menu_mais.html',
    '/stitch/kids/kids-prayers.html',
    '/stitch/kids/parental-gate.js',
    '/stitch/kids/kids-audio-engine.js',
    '/stitch/ungidos_v2/checkin_emocional.html',
    '/stitch/ungidos_v2/mentor_ia_response.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Poppins:wght@700;800&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('🛡️ [Service Worker] Caching Hunger Assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🛡️ [Service Worker] Cleaning Old Cache...');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return response
            if (response) return response;

            // Clone the request
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    // Don't cache API calls or dynamic responses unless specific
                    if (event.request.url.indexOf('supabase') === -1) {
                        cache.put(event.request, responseToCache);
                    }
                });

                return response;
            }).catch(() => {
                // Return offline fallback if needed
            });
        })
    );
});
