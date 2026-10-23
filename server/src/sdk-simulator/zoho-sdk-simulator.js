/**
 * Zoho CRM Embedded App SDK Simulator
 * Provides the global window.ZOHO object inside widget preview iframes.
 * Communicates with the Studio host via a controlled postMessage bridge.
 */
(function(window) {
  'use strict';

  // Event handlers registered by the widget
  var eventListeners = {};
  var pendingRequests = {};
  var isInitialized = false;
  var cachedPageLoadPayload = null;

  // Intercept Console Logs
  var originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  function serializeArg(arg) {
    if (arg === null) return null;
    if (arg === undefined) return undefined;
    if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') return arg;
    if (arg instanceof Error) {
      return { message: arg.message, stack: arg.stack, name: arg.name };
    }
    try {
      return JSON.parse(JSON.stringify(arg));
    } catch (e) {
      return String(arg);
    }
  }

  ['log', 'info', 'warn', 'error'].forEach(function(level) {
    console[level] = function() {
      var args = Array.prototype.slice.call(arguments);
      originalConsole[level].apply(console, args);

      try {
        var serialized = args.map(serializeArg);
        window.parent.postMessage({
          type: 'CONSOLE_LOG',
          level: level,
          args: serialized,
          timestamp: new Date().toISOString()
        }, '*');
      } catch (e) {
        // fail-safe
      }
    };
  });

  // Intercept Global Errors
  window.addEventListener('error', function(event) {
    window.parent.postMessage({
      type: 'RUNTIME_ERROR',
      message: event.message || 'Unknown runtime error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : undefined,
      timestamp: new Date().toISOString()
    }, '*');
  });

  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = reason instanceof Error ? reason.message : String(reason);
    var stack = reason instanceof Error ? reason.stack : undefined;
    window.parent.postMessage({
      type: 'RUNTIME_ERROR',
      message: 'Unhandled Promise Rejection: ' + message,
      stack: stack,
      timestamp: new Date().toISOString()
    }, '*');
  });

  // Handle incoming messages from Studio parent frame
  window.addEventListener('message', function(event) {
    var msg = event.data;
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'ZOHO_SDK_RESPONSE') {
      var reqId = msg.requestId;
      if (pendingRequests[reqId]) {
        var handler = pendingRequests[reqId];
        delete pendingRequests[reqId];
        if (msg.success) {
          handler.resolve(msg.data);
        } else {
          handler.reject(msg.error || new Error('SDK call failed'));
        }
      }
    } else if (msg.type === 'SDK_PAGELOAD_TRIGGER') {
      cachedPageLoadPayload = msg.payload;
      var listeners = eventListeners['PageLoad'] || [];
      listeners.forEach(function(cb) {
        try {
          cb(msg.payload);
        } catch (err) {
          console.error('Error in PageLoad handler:', err);
        }
      });
    }
  });

  function callBridge(category, action, params) {
    return new Promise(function(resolve, reject) {
      var requestId = 'req_' + Math.random().toString(36).substring(2, 10);
      pendingRequests[requestId] = { resolve: resolve, reject: reject };

      window.parent.postMessage({
        type: 'ZOHO_SDK_CALL',
        requestId: requestId,
        category: category,
        action: action,
        params: params || {}
      }, '*');
    });
  }

  // Zoho SDK Object Definition
  var ZOHO = {
    embeddedApp: {
      init: function() {
        return new Promise(function(resolve) {
          isInitialized = true;
          window.parent.postMessage({ type: 'SDK_READY' }, '*');
          
          // Small tick to ensure parent handles init
          setTimeout(function() {
            resolve();
          }, 10);
        });
      },

      on: function(eventName, callback) {
        if (!eventListeners[eventName]) {
          eventListeners[eventName] = [];
        }
        eventListeners[eventName].push(callback);

        // If this is PageLoad and we already received PageLoad payload from host, fire it immediately
        if (eventName === 'PageLoad' && cachedPageLoadPayload) {
          setTimeout(function() {
            try {
              callback(cachedPageLoadPayload);
            } catch (err) {
              console.error('Error in PageLoad handler:', err);
            }
          }, 0);
        }
      },

      Trigger: function(eventName, data) {
        window.parent.postMessage({
          type: 'ZOHO_SDK_TRIGGER',
          eventName: eventName,
          data: data
        }, '*');
      }
    },

    CRM: {
      API: {
        getRecord: function(params) {
          return callBridge('CRM.API', 'getRecord', params);
        },
        getAllRecords: function(params) {
          return callBridge('CRM.API', 'getAllRecords', params);
        },
        insertRecord: function(params) {
          return callBridge('CRM.API', 'insertRecord', params);
        },
        updateRecord: function(params) {
          return callBridge('CRM.API', 'updateRecord', params);
        },
        deleteRecord: function(params) {
          return callBridge('CRM.API', 'deleteRecord', params);
        },
        searchRecord: function(params) {
          return callBridge('CRM.API', 'searchRecord', params);
        }
      },

      UI: {
        Record: {
          open: function(params) {
            return callBridge('CRM.UI', 'Record.open', params);
          }
        },
        Popup: {
          close: function() {
            return callBridge('CRM.UI', 'Popup.close', {});
          },
          closeReload: function() {
            return callBridge('CRM.UI', 'Popup.closeReload', {});
          }
        }
      },

      CONFIG: {
        getCurrentUser: function() {
          return callBridge('CRM.CONFIG', 'getCurrentUser', {});
        },
        getOrgInfo: function() {
          return callBridge('CRM.CONFIG', 'getOrgInfo', {});
        }
      },

      CONNECTIONS: {
        invoke: function(connName, reqData) {
          return callBridge('CRM.CONNECTIONS', 'invoke', { connectionName: connName, requestData: reqData });
        }
      }
    }
  };

  window.ZOHO = ZOHO;

  // Let parent know script is loaded
  window.parent.postMessage({ type: 'SDK_SCRIPT_LOADED' }, '*');
})(window);
