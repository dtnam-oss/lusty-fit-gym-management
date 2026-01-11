/**
 * API Client for Google Apps Script Backend
 * Replaces google.script.run for deployed frontend
 */

class GASClient {
  constructor(webAppUrl, debug = false) {
    this.webAppUrl = webAppUrl;
    this.debug = debug;
    this.successHandler = null;
    this.failureHandler = null;
  }

  log(...args) {
    if (this.debug) {
      console.log('[GAS Client]', ...args);
    }
  }

  /**
   * Call GAS function
   */
  async call(functionName, ...params) {
    this.log(`Calling ${functionName} with params:`, params);

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionName,
          parameters: params
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.log(`Response from ${functionName}:`, data);

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      const result = data.data;

      if (this.successHandler) {
        this.successHandler(result);
        this.successHandler = null; // Reset
      }

      return result;

    } catch (error) {
      this.log(`Error calling ${functionName}:`, error);

      if (this.failureHandler) {
        this.failureHandler(error);
        this.failureHandler = null; // Reset
      } else {
        throw error;
      }
    }
  }

  /**
   * Set success handler (chainable)
   */
  withSuccessHandler(callback) {
    this.successHandler = callback;
    return this;
  }

  /**
   * Set failure handler (chainable)
   */
  withFailureHandler(callback) {
    this.failureHandler = callback;
    return this;
  }

  /**
   * Create a proxy for dynamic function calls
   */
  createProxy() {
    return new Proxy(this, {
      get: (target, functionName) => {
        if (typeof functionName === 'string' && !functionName.startsWith('_')) {
          return (...params) => target.call(functionName, ...params);
        }
        return target[functionName];
      }
    });
  }
}

// Initialize global API client
const gasClient = new GASClient(GAS_CONFIG.WEB_APP_URL, GAS_CONFIG.DEBUG);
const gasAPI = gasClient.createProxy();

/**
 * Compatibility layer - mimics google.script.run API
 */
const google = {
  script: {
    run: new Proxy(gasClient, {
      get: (target, functionName) => {
        if (functionName === 'withSuccessHandler') {
          return (callback) => {
            target.successHandler = callback;
            return google.script.run;
          };
        }
        if (functionName === 'withFailureHandler') {
          return (callback) => {
            target.failureHandler = callback;
            return google.script.run;
          };
        }
        // Direct function call
        return (...params) => target.call(functionName, ...params);
      }
    })
  }
};

// Log ready status
console.log('✅ GAS API Client ready');
console.log('📡 Backend URL:', GAS_CONFIG.WEB_APP_URL);
