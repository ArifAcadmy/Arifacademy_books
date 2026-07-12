// Adsterra Ads Configuration
// You can replace the source (src) and key (key) parameters with the exact codes from your Adsterra dashboard.
const AD_CONFIG = {
  socialBar: {
    enabled: true,
    src: 'https://pl30331196.effectivecpmnetwork.com/09/42/71/0942710e78a69431a8f821a2cb34e717.js'
  },
  banner468x60: {
    enabled: true,
    key: 'dc73ee81a718c4dd040b3e1e96aa82e7',
    src: '//www.highperformanceformat.com/dc73ee81a718c4dd040b3e1e96aa82e7/invoke.js'
  },
  nativeBanner: {
    enabled: true,
    key: '30230921',
    src: '//www.highperformanceformat.com/30230921/invoke.js'
  },
  smartlink: {
    enabled: true,
    url: 'https://www.effectivecpmnetwork.com/pumyghmxfu?key=92d17702b6b8ef851be75232ca350f7d' // Replace with your exact Smartlink URL
  }
};

// 1. Load Social Bar
try {
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = AD_CONFIG.socialBar.src;
  s.async = true;
  document.body.appendChild(s);
} catch (e) {
  console.error('Error loading Social Bar:', e);
}

// 2. Load Banner 468x60
const bannerContainer = document.getElementById('ad-banner-container');
if (bannerContainer && AD_CONFIG.banner468x60.enabled) {
  try {
    window.atOptions = {
      'key': AD_CONFIG.banner468x60.key,
      'format': 'iframe',
      'height': 60,
      'width': 468,
      'params': {}
    };
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = AD_CONFIG.banner468x60.src;
    s.async = true;
    bannerContainer.appendChild(s);
  } catch (e) {
    console.error('Error loading Banner ad:', e);
  }
}

// 3. Load Native Banner (ID: 30230921)
const nativeContainer = document.getElementById('ad-native-banner-container');
if (nativeContainer && AD_CONFIG.nativeBanner.enabled) {
  try {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = AD_CONFIG.nativeBanner.src;
    s.async = true;
    // Set parameters inside script tag
    s.setAttribute('data-cfasync', 'false');
    nativeContainer.appendChild(s);
  } catch (e) {
    console.error('Error loading Native Banner:', e);
  }
}

// 4. Handle Smartlink redirection for download buttons
if (AD_CONFIG.smartlink.enabled) {
  document.addEventListener('click', (e) => {
    // Check if the clicked element has id 'downloadButton'
    if (e.target && e.target.id === 'downloadButton') {
      try {
        // Open the Smartlink in a new tab to monetize the action
        window.open(AD_CONFIG.smartlink.url, '_blank');
      } catch (err) {
        console.error('Error opening Smartlink:', err);
      }
    }
  });
}
