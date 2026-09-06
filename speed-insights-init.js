// ============================================================
// VERCEL SPEED INSIGHTS INITIALIZATION
// Dynamically loads and initializes Vercel Speed Insights
// ============================================================

(async function() {
  try {
    // Dynamically import the Speed Insights module
    const { injectSpeedInsights } = await import('./node_modules/@vercel/speed-insights/dist/index.mjs');
    
    // Initialize Speed Insights
    if (typeof window !== 'undefined') {
      injectSpeedInsights({
        debug: false
      });
      console.log('[Speed Insights] Initialized successfully');
    }
  } catch (error) {
    console.error('[Speed Insights] Failed to initialize:', error);
  }
})();
