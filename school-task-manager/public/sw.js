// Service worker: clear all caches and unregister self
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', async () => {
  // Delete every cache bucket
  const keys = await caches.keys()
  await Promise.all(keys.map(k => caches.delete(k)))
  // Unregister this service worker so the browser goes straight to network
  await self.registration.unregister()
  // Reload all open tabs so they get fresh content
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach(client => client.navigate(client.url))
})
