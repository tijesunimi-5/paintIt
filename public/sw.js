// public/sw.js (or wherever your sw.js is located)
const CACHE_NAME = "paintit-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/models/selfcon.glb", // Your hostel model path
  "/models/model1.glb",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("🛡️ Caching assets resiliently...");

      // Use Promise.allSettled so one failing or missing file won't break the entire app
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`⚠️ Failed to cache asset: ${url}`, err);
          });
        }),
      );
    }),
  );
  self.skipWaiting();
});
