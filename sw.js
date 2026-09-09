self.options = {
    "domain": "5gvci.com",
    "zoneId": 11419808
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')

const CACHE_NAME = 'pycodes-compiler-v1';

// यहाँ वो फाइल्स डालें जिन्हें आप पक्के तौर पर ऑफलाइन चाहते हैं
const urlsToCache = [
  '/html.html',
  '/python.html', 
 
];

// 1. Install Event - बेसिक फाइल्स को Cache में सेव करना
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Event - ऑफलाइन होने पर Cache से डेटा देना
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // अगर फाइल Cache में मिल गई, तो वहीं से रिटर्न कर दो (ऑफलाइन के लिए)
        if (response) {
          return response;
        }

        // अगर फाइल Cache में नहीं है, तो इंटरनेट से लाओ
        return fetch(event.request).then(
          function(networkResponse) {
            // अगर रिस्पॉन्स सही नहीं है, तो उसे ही रिटर्न कर दो
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }

            // रिस्पॉन्स को क्लोन करें क्योंकि इसे Cache में भी सेव करना है और ब्राउज़र को भी देना है
            var responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // FontAwesome और Google Fonts जैसी बाहरी लिंक्स को भी Cache में डायनामिकली सेव कर लें
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(function() {
            // अगर यूजर पूरी तरह ऑफलाइन है और फाइल Cache में भी नहीं है
            console.log("Offline and resource not found in cache.");
        });
      })
  );
});

// 3. Activate Event - पुराने Cache को डिलीट करना
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
