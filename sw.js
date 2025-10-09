
self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open('craneos-cache-v1').then(cache=> cache.addAll([
      './','index.html',
    ].concat(self.predefined || [])))
  );
});
self.addEventListener('fetch', (event)=>{
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(resp=> resp || fetch(event.request).then(r=>{
      const copy = r.clone();
      caches.open('craneos-cache-v1').then(cache=>{
        if(event.request.method==='GET' && r.ok) cache.put(event.request, copy);
      });
      return r;
    }).catch(()=> caches.match('./')))
  );
});
