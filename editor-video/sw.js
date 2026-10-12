// Service worker: deja usar la app sin internet después de la primera vez
// que se abre (los archivos quedan guardados en el celular).
const CACHE = "editor-video-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((guardado) => {
      if (guardado) return guardado;
      return fetch(e.request)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
          return resp;
        })
        .catch(() => guardado);
    })
  );
});
