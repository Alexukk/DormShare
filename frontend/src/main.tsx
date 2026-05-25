import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register standard PWA Service Worker for offlining capabilities in production,
// and clean up active service workers/caches in development to avoid stale asset caching.
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let unregistered = false;
      for (const registration of registrations) {
        registration.unregister();
        unregistered = true;
      }
      if (caches) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
      if (unregistered) {
        console.log('[Dev SW Cleanup] Unregistered active service worker and cleared cache to prevent stale layout caching. Reloading...');
        window.location.reload();
      }
    });
  }
} else {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[Service Worker] Registered successfully with scope:', reg.scope)
        })
        .catch((err) => {
          console.error('[Service Worker] Registration failed:', err)
        })
    })
  }
}

