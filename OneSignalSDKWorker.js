// 1. Εισαγωγή του OneSignal (Κρατάμε τη γραμμή που είχες για να δουλεύουν τα Push)
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// 2. Ρυθμίσεις Cache (Για ταχύτητα και Live Score)
const CACHE_NAME = 'olympos-v5'; // Αλλάζουμε έκδοση
const DATA_URL = 'data.json'; // Το αρχείο που ΔΕΝ πρέπει να κολλάει

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo_front.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&family=Inter:wght@400;600;700&display=swap'
];

// Εγκατάσταση (Install) - Αποθήκευση βασικών αρχείων
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Ενεργοποίηση (Activate) - Καθαρισμός παλιών εκδόσεων
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Στρατηγική Fetch (Το μυστικό για το Live Score)
self.addEventListener('fetch', (event) => {
    // 1. Αν ζητάει το data.json (Σκορ), ΠΑΝΤΑ από το ίντερνετ (Network Only)
    if (event.request.url.includes(DATA_URL)) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Για όλα τα άλλα, πρώτα από μνήμη (Cache First)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
