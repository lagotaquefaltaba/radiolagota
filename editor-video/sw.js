// Service worker: deja usar la app sin internet después de la primera vez
// que se abre (los archivos quedan guardados en el celular).
const CACHE = "editor-video-v28";
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

// La página principal (el HTML) se busca SIEMPRE primero en internet, para
// que una actualización se vea apenas se abre la app con señal -y si no
// hay internet, ahí sí se usa la última copia guardada. Los demás archivos
// (ícono, manifest) casi no cambian, así que esos sí se sirven primero
// desde lo guardado (más rápido) y se actualizan en segundo plano.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  var esPagina = e.request.mode === "navigate" || e.request.url.endsWith("/") || e.request.url.endsWith("index.html");

  if (esPagina) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

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
