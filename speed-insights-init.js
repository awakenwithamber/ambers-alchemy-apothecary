/**
 * Vercel Speed Insights initialization
 * Automatically tracks Core Web Vitals and performance metrics
 * 
 * This script loads the Speed Insights tracker from CDN and initializes it.
 * The tracker will automatically collect Web Vitals metrics (LCP, FID, CLS, etc.)
 * and send them to Vercel's Speed Insights dashboard when the site is deployed.
 */

// Load Speed Insights from CDN and inject it
(function() {
  // Import and initialize Speed Insights
  import('https://cdn.jsdelivr.net/npm/@vercel/speed-insights@2.0.0/dist/index.mjs')
    .then(module => {
      if (module.injectSpeedInsights) {
        module.injectSpeedInsights();
      }
    })
    .catch(err => {
      console.warn('[Speed Insights] Failed to load:', err);
    });
})();
