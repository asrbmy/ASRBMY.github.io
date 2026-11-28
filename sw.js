/*
  Service worker: makes repeat visits fast and lets the site open offline.

  - Pages (HTML) and data files (posts.js, pinned.json, feeds): network first, so you always
    see new posts and edits; the saved copy is only used when you are offline or the network is slow.
  - Fonts, images, CSS and scripts: served instantly from cache, then refreshed in the background.
  - Never touches /admin/ or /tools/, other websites, or anything that is not a GET request.

  To force every visitor to drop old caches after a big change, bump CACHE_VERSION below.
*/
const CACHE_VERSION = 'v1';
const CACHE = 'asrbmy-' + CACHE_VERSION;
const FRESH_FILES = /\/(posts\.js|pinned\.json|sitemap\.xml|rss\.xml|llms\.txt|robots\.txt)$/;
const SLOW_NETWORK_MS = 4000;

// Saved on first visit so the site can open offline straight away
const PRECACHE = [
  '/', '/index.html', '/blog/index.html', '/projects/index.html',
  '/assets/blog.css', '/assets/blog.js', '/assets/preloader.js',
  '/assets/fonts/inter-var.woff2', '/assets/fonts/space-grotesk-var.woff2', '/assets/fonts/jetbrains-mono-var.woff2',
  '/assets/img/logo.webp', '/assets/img/logo-light.webp', '/favicon-64.png', '/favicon-light-64.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('asrbmy-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(request) {
  const network = fetch(request).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); }
    return res;
  });
  const timeout = new Promise((resolve) => setTimeout(resolve, SLOW_NETWORK_MS, null));
  return Promise.race([network, timeout]).then((res) => res || caches.match(request).then((hit) => hit || network))
    .catch(() => caches.match(request).then((hit) => hit || caches.match('/index.html')));
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((hit) => {
      const refresh = fetch(request).then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (/^\/(admin|tools)\//.test(url.pathname)) return;
  if (req.headers.has('range')) return;

  if (req.mode === 'navigate' || req.destination === 'document' || FRESH_FILES.test(url.pathname)) {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(staleWhileRevalidate(req));
  }
});
