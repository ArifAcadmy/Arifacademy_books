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

// Redirect to Google Search only when clicking inside "Our Services" or "Ads" sections
document.addEventListener('click', (event) => {
  const isTargetSection = event.target.closest('.ads-wrapper, .services-section, .services-sidebar-card');
  if (isTargetSection) {
    window.open('https://www.google.com/search?q=arif+academy', '_blank');
  }
});
