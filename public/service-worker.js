console.log('regis worker');

const cacheName = 'v1';

const cacheClone = async (e) => {
  const res = await fetch(e.request);
  const resClone = res.clone();
  const cache = await caches.open(cacheName);
  await cache.put(e.request, resClone);
  return res;
};

function fetchEvent() {
  self.addEventListener('fetch', (e) => {
    if (!e.request.method === 'GET') {
      return;
    }
    e.respondWith(
      cacheClone(e)
        .catch(() => {
          return caches.match(e.request);
        })
        .then((res) => {
          return res;
        })
    );
  });
}

fetchEvent();
