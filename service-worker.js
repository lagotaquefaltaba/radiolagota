importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAlUrPS3z63XaCHHDYR-Q6xKamfMSXZQj1A",
  authDomain: "radio-la-gota-ea116.firebaseapp.com",
  projectId: "radio-la-gota-ea116",
  storageBucket: "radio-la-gota-ea116.firebasestorage.app",
  messagingSenderId: "716796347803",
  appId: "1:716796347803:web:6a7ff1dd276f7fbae271be"
});

const messaging = firebase.messaging();

// Recibir aunque la app esté cerrada
messaging.onBackgroundMessage((payload) => {
  return self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "https://i.imgur.com/17A2JLJ.jpg",
    badge: "https://i.imgur.com/17A2JLJ.jpg",
    data: { url: "/" }
  });
});

self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ------------------------------------------------------------------
// Agregado aparte, sin tocar nada de lo de arriba (las notificaciones
// push de Firebase siguen funcionando exactamente igual). Esto es lo
// que permite que la app funcione instalada de verdad y abra rápido
// -son "oyentes" del mismo evento, no reemplazan a los de arriba: un
// Service Worker puede tener varios, y el navegador espera a que
// todos terminen.
//
// OJO al subir una versión nueva de la app: cambiá CACHE_NAME (por
// ejemplo a "lagota-pwa-v2") para que los celulares que ya la tienen
// instalada bajen los archivos nuevos en vez de seguir usando los
// guardados.
// ------------------------------------------------------------------

const CACHE_NAME = "lagota-pwa-v1";
const ARCHIVOS_DE_LA_APP = [
  "./",
  "./index.html",
  "./manifest.json",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_DE_LA_APP))
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
});

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);

  // El streaming en vivo y los audios de Dropbox NUNCA se cachean: son
  // contenido que cambia todo el tiempo (la radio) o muy pesado (los
  // programas grabados) -guardarlos rompería la radio en vivo o
  // llenaría el espacio del celular sin sentido.
  if (url.hostname.includes("lagota.online") || url.hostname.includes("dropbox.com")) {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then((respuestaGuardada) => {
      if (respuestaGuardada) return respuestaGuardada;
      return fetch(evento.request)
        .then((respuestaDeInternet) => {
          if (evento.request.method === "GET" && respuestaDeInternet.ok) {
            const copia = respuestaDeInternet.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, copia));
          }
          return respuestaDeInternet;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
