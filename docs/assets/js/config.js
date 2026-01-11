/**
 * Configuration for GAS Backend
 *
 * IMPORTANT: Update WEB_APP_URL with your deployed GAS Web App URL
 * Get it from: Apps Script → Deploy → Manage deployments → Web app URL
 */
const GAS_CONFIG = {
  // Replace with your GAS Web App URL
  WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec',

  // API version (for future use)
  API_VERSION: 'v1',

  // Enable debug mode
  DEBUG: true
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAS_CONFIG;
}
