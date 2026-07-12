export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const swUrl = new URL('../../sw.js', import.meta.url).href;
        await navigator.serviceWorker.register(swUrl);
      } catch (error) {
        console.warn('Service worker registration failed.', error);
      }
    });
  }
}
