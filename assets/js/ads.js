// Adsterra Ads Configuration
// You can replace the source (src) and key (key) parameters with the exact codes from your Adsterra dashboard.
const AD_CONFIG = {
  popunder: {
    enabled: true,
    src: 'https://pl30331197.effectivecpmnetwork.com/78/8a/7d/788a7d599e7a9cfee2fb4b7f5f766124.js'
  },
  socialBar: {
    enabled: true,
    src: 'https://pl30331196.effectivecpmnetwork.com/09/42/71/0942710e78a69431a8f821a2cb34e717.js'
  },
  banner468x60: {
    enabled: true,
    key: 'dc73ee81a718c4dd040b3e1e96aa82e7',
    src: '//www.highperformanceformat.com/dc73ee81a718c4dd040b3e1e96aa82e7/invoke.js'
  }
};

// Load Popunder
try {
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = AD_CONFIG.popunder.src;
  s.async = true;
  document.head.appendChild(s);
} catch (e) {
  console.error('Error loading Popunder:', e);
}

// Load Social Bar
try {
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = AD_CONFIG.socialBar.src;
  s.async = true;
  document.body.appendChild(s);
} catch (e) {
  console.error('Error loading Social Bar:', e);
}

// Load Banner 468x60 inside the target slot
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
