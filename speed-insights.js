/*
 * speed-insights.js — Vercel Speed Insights loader
 * 
 * Initializes Vercel Speed Insights for performance tracking.
 * This script should be loaded in the document head.
 */
(function() {
  'use strict';
  
  // Initialize Speed Insights queue
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };
  
  // Load the Speed Insights script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. This is expected in local development.');
  };
  document.head.appendChild(script);
})();
