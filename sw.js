const CACHE_NAME = "pilgrim-card-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./umrah-guide.html",
  "./generator.html",
  "./manifest.json",
  "./favicon-32.png",
  "./icon-180.png",
  "https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&family=Tajawal:wght@400;500;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
];

// تثبيت ملف الخدمة وتخزين الملفات الثابتة
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل وتحديث النسخ السابقة
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// الاستجابة للطلبات من الذاكرة المحلية أولاً عند انقطاع الإنترنت
self.addEventListener("fetch", (e) => {
  // عدم اعتراض طلبات الـ API الخاصة بجوجل سكربت لضمان حداثة البيانات عند وجود اتصال
  if (e.request.url.includes("script.google.com")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
