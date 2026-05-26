const CACHE_NAME = 'pioneiro-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install - prÃ©-cache dos assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate - limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => n !== CACHE_NAME && caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Fetch - network first para API, cache first para assets estÃ¡ticos
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Para requisiÃ§Ãµes de API, tenta network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Para assets estÃ¡ticos, cache first com fallback para network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background Sync - sincroniza atividades pendentes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-atividades') {
    event.waitUntil(sincronizarAtividades());
  }
});

// Periodic Background Sync - atualiza dados periodicamente em background
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(atualizarDadosBackground());
  }
});

async function atualizarDadosBackground() {
  // Notifica os clientes para atualizar os dados
  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach((client) => {
    client.postMessage({ type: 'BACKGROUND_SYNC', action: 'refresh' });
  });
}

async function sincronizarAtividades() {
  const db = await abrirDB();
  const pendentes = await lerPendentes(db);

  for (const item of pendentes) {
    try {
      const res = await fetch('/api/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.dados),
      });
      if (res.ok) {
        await removerPendente(db, item.id);
      }
    } catch (_) {
      // SerÃ¡ tentado novamente
    }
  }
}

// IndexedDB helpers
function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('pioneiro-offline', 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('pendentes', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function lerPendentes(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendentes', 'readonly');
    const req = tx.objectStore('pendentes').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function removerPendente(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendentes', 'readwrite');
    const req = tx.objectStore('pendentes').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Pioneiro Regular App', {
      body: data.body || 'Nova notificaÃ§Ã£o',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'pioneiro-notification',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
