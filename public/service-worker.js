// VioTech Pro - Service Worker con Push Notifications
// Simple offline-first caching for static assets + Push Notifications

const CACHE_NAME = "viotech-static-v2";

// ============================================
// ERROR HANDLER - Capturar errores no controlados
// ============================================
self.addEventListener("error", (event) => {
  // Silenciar errores de extensiones del navegador
  if (event.message && event.message.includes("runtime.lastError")) {
    event.preventDefault();
    return;
  }
  // Loguear otros errores solo en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.error("Service Worker Error:", event.error);
  }
});

self.addEventListener("unhandledrejection", (event) => {
  // Silenciar errores de extensiones del navegador
  const errorMessage = event.reason?.message || String(event.reason || "");
  if (errorMessage.includes("runtime.lastError") || 
      errorMessage.includes("Receiving end does not exist")) {
    event.preventDefault();
    return;
  }
  // Loguear otros errores solo en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.error("Service Worker Unhandled Rejection:", event.reason);
  }
});

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// ============================================
// FETCH EVENT - Static Assets Caching
// ============================================
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Solo manejamos estáticos propios; dejamos pasar API y cross-origin.
  const isSameOrigin = url.origin === self.location.origin;
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(url.pathname);

  if (!isSameOrigin || !isStatic) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const networkResp = await fetch(req);
        cache.put(req, networkResp.clone());
        return networkResp;
      } catch (_error) {
        const cachedResp = await cache.match(req);
        if (cachedResp) return cachedResp;
        throw _error;
      }
    }),
  );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener("push", (event) => {
  // Parsear datos del push o usar valores por defecto
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    // Si no es JSON, intentar como texto
    data = { body: event.data?.text() || "Tienes una nueva notificación" };
  }

  const title = data.title || "VioTech Pro";
  const options = {
    body: data.body || "Tienes una nueva notificación",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/badge-72.png",
    image: data.image || undefined,
    tag: data.tag || "viotech-notification",
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    data: {
      url: data.url || "/",
      notificationId: data.notificationId,
      type: data.type,
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: "view", title: "Ver", icon: "/icons/view.png" },
      { action: "dismiss", title: "Descartar", icon: "/icons/dismiss.png" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ============================================
// NOTIFICATION CLICK HANDLER
// ============================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  const url = notificationData.url || "/";

  // Manejar acciones específicas
  if (action === "dismiss") {
    // El usuario descartó la notificación, opcionalmente marcar como leída
    if (notificationData.notificationId) {
      // Enviar evento al backend para marcar como leída (fire and forget)
      fetch(`/api/notifications/${notificationData.notificationId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {
        // Silenciar errores
      });
    }
    return;
  }

  // Acción por defecto: abrir la URL
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Buscar si ya hay una ventana abierta con la app
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // Navegar a la URL dentro de la ventana existente
            // Verificar que el cliente todavía existe antes de enviar mensaje
            try {
              if (client && typeof client.postMessage === "function") {
                client.postMessage({
                  type: "NOTIFICATION_CLICK",
                  url: url,
                  notificationId: notificationData.notificationId,
                }).catch(() => {
                  // Silenciar errores de comunicación (cliente cerrado)
                });
              }
              return client.focus();
            } catch (error) {
              // Si falla, continuar con el siguiente cliente o abrir nueva ventana
              console.debug("Error enviando mensaje a cliente:", error);
            }
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(url).catch((error) => {
            // Silenciar errores al abrir ventana (puede ser bloqueado por popup blocker)
            console.debug("Error abriendo ventana:", error);
          });
        }
      })
      .catch((error) => {
        // Silenciar errores al obtener clientes
        console.debug("Error obteniendo clientes:", error);
      }),
  );
});

// ============================================
// PUSH SUBSCRIPTION CHANGE
// ============================================
self.addEventListener("pushsubscriptionchange", (event) => {
  // Cuando la suscripción cambia, necesitamos re-suscribir
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        // Enviar nueva suscripción al backend
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
      })
      .catch((error) => {
        console.error("Push subscription change error:", error);
      }),
  );
});

// ============================================
// MESSAGE HANDLER - Comunicación con la app
// ============================================
self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "GET_SUBSCRIPTION":
      // Obtener la suscripción actual
      self.registration.pushManager
        .getSubscription()
        .then((subscription) => {
          // Verificar que el puerto todavía existe antes de enviar mensaje
          if (event.ports && event.ports[0]) {
            try {
              event.ports[0].postMessage({
                type: "SUBSCRIPTION_STATUS",
                subscription: subscription ? subscription.toJSON() : null,
              });
            } catch (error) {
              // Silenciar errores si el puerto ya no existe
              console.debug("Error enviando mensaje de suscripción:", error);
            }
          }
        })
        .catch((error) => {
          // Verificar que el puerto todavía existe antes de enviar error
          if (event.ports && event.ports[0]) {
            try {
              event.ports[0].postMessage({
                type: "SUBSCRIPTION_ERROR",
                error: error.message,
              });
            } catch (portError) {
              // Silenciar errores si el puerto ya no existe
              console.debug("Error enviando mensaje de error:", portError);
            }
          }
        });
      break;

    case "CLEAR_CACHE":
      caches.delete(CACHE_NAME).then(() => {
        // Verificar que el puerto todavía existe antes de enviar mensaje
        if (event.ports && event.ports[0]) {
          try {
            event.ports[0].postMessage({ type: "CACHE_CLEARED" });
          } catch (error) {
            // Silenciar errores si el puerto ya no existe
            console.debug("Error enviando mensaje de cache:", error);
          }
        }
      });
      break;

    default:
      break;
  }
});
