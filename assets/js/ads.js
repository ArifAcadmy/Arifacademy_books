// Adsterra Ads Configuration
const AD_CONFIG = {
  socialBar: {
    enabled: true,
    src: 'https://pl30331196.effectivecpmnetwork.com/09/42/71/0942710e78a69431a8f821a2cb34e717.js'
  },
  banner160x300: {
    enabled: true,
    key: '6a5e0070b9078b481fecca8c6f34f9bd',
    src: '//www.highperformanceformat.com/6a5e0070b9078b481fecca8c6f34f9bd/invoke.js'
  },
  native41: {
    enabled: true,
    src: 'https://pl30331420.effectivecpmnetwork.com/d577cf934f0808903c3a3787ac90265c/invoke.js'
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

// 2. Load Banner 160x300 (Sidebar Left)
const sidebarLeft = document.getElementById('ad-sidebar-left');
if (sidebarLeft && AD_CONFIG.banner160x300.enabled) {
  try {
    window.atOptions = {
      'key': AD_CONFIG.banner160x300.key,
      'format': 'iframe',
      'height': 300,
      'width': 160,
      'params': {}
    };
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = AD_CONFIG.banner160x300.src;
    s.async = true;
    sidebarLeft.appendChild(s);
  } catch (e) {
    console.error('Error loading Sidebar 160x300 ad:', e);
  }
}

// 3. Load Native Banner 4:1
const nativeContainer = document.getElementById('container-d577cf934f0808903c3a3787ac90265c');
if (nativeContainer && AD_CONFIG.native41.enabled) {
  try {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = AD_CONFIG.native41.src;
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    document.body.appendChild(s);
  } catch (e) {
    console.error('Error loading Native Banner 4:1 ad:', e);
  }
}
