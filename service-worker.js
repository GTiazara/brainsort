const CACHE_NAME = "brainsort-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/number.html",
  "./src/alphabet.html",
  "./src/words.html",
  "./src/shapes.html",
  "./src/privacy.html",
  "./js/shared.js",
  "./sounds/click.wav",
  "./sounds/success.wav",
  "./sounds/fail.wav"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
