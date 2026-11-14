// Offline: the page is network-first (so updates arrive), everything else is
// cache-first and saved the first time it loads. Photos are fetched up front.
const CACHE = 'solsurvivor-v1'
const PHOTOS = ['landing', 'delta', 'wildcat', 'depot', 'rim', 'cheyava', 'flight', 'seitah', 'blue-sunset', 'moon-landing', 'malapert', 'moon-pole', 'lcross', 'aitken', 'lro-earth']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(['./', 'manifest.webmanifest', 'icon.svg', ...PHOTOS.map((p) => `photos/${p}.jpg`)]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const sameOrigin = url.origin === location.origin
  const fonts = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com'
  if (!sameOrigin && !fonts) return
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone()
          caches.open(CACHE).then((c) => c.put('./', copy))
          return r
        })
        .catch(() => caches.match('./')),
    )
    return
  }
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((r) => {
          if (r.ok || r.type === 'opaque') {
            const copy = r.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return r
        }),
    ),
  )
})
