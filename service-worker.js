



const CACHE_NAME = 'ai-tic-tac-toe-v6'; // Bumped cache version
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/services/soundService.ts',
  '/services/soundData.ts',
  '/services/dbService.ts',
  '/services/statisticsService.ts',
  '/services/achievementsService.ts',
  '/components/Board.tsx',
  '/components/GameStatus.tsx',
  '/components/LevelSelection.tsx',
  '/components/DifficultySelection.tsx',
  '/components/SplashScreen.tsx',
  '/components/Square.tsx',
  '/components/WinningLine.tsx',
  '/components/Scoreboard.tsx',
  '/components/Ad.tsx',
  '/components/AdOverlay.tsx',
  '/components/RewardedAdOverlay.tsx',
  '/components/MuteButton.tsx',
  '/components/AdminPanelModal.tsx',
  '/components/AdminLoginModal.tsx',
  '/components/ProgressSaveIndicator.tsx',
  '/components/ProfileView.tsx',
  '/components/StatisticsView.tsx',
  '/components/AchievementsView.tsx',
  '/components/AchievementToast.tsx',
  '/manifest.json',
  '/sounds/button.mp3',
  '/sounds/place.mp3',
  '/sounds/win.mp3',
  '/sounds/lose.mp3',
  '/sounds/draw.mp3',
  '/sounds/notification.mp3',
  '/sounds/hint.mp3',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'
];

// On install, cache the core assets.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Create a new request for each URL to avoid "Request contains a redirect" error.
        const promises = URLS_TO_CACHE.map(url => {
          return fetch(new Request(url, { mode: 'no-cors' })).then(response => {
             // It's important to check for a valid response, especially with no-cors.
            if (response.status === 200 || response.type === 'opaque') {
              return cache.put(url, response);
            }
            console.warn(`Skipping caching for ${url} due to response status: ${response.status}`);
            return Promise.resolve();
          });
        });
        return Promise.all(promises);
      })
  );
});

// On activate, clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// On fetch, use a cache-first strategy.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Don't cache Gemini API calls. Let them go to the network.
  if (request.url.includes('generativelanguage.googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Don't cache esm.sh imports; let them be fetched.
  if (request.url.includes('esm.sh')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      })
    );
    return;
  }


  // For app assets, try the cache first.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Return the cached response if found.
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from the network.
      // This is important for development or if something wasn't in the initial cache list.
      return fetch(request).then(response => {
        // Cache the new resource on the fly.
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      });
    })
  );
});