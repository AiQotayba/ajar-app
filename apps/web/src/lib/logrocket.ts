/**
 * LogRocket initialization and configuration
 * 
 * This module initializes LogRocket for session replay and error tracking.
 * Make sure to set NEXT_PUBLIC_LOGROCKET_APP_ID in your environment variables.
 */

import LogRocket from 'logrocket';

// Initialize LogRocket only on client side
if (typeof window !== 'undefined') {
  const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;

  if (appId) {
    LogRocket.init(appId, {
      // Capture console logs
      console: {
        isEnabled: {
          log: true,
          debug: true,
          info: true,
          warn: true,
          error: true,
        },
      },
      // Network request capture
      network: {
        isEnabled: true,
        requestSanitizer: (request) => {
          // Sanitize sensitive data from requests
          if (request.headers) {
            // Remove authorization headers
            if (request.headers.authorization) {
              request.headers.authorization = '[REDACTED]';
            }
            if (request.headers.Authorization) {
              request.headers.Authorization = '[REDACTED]';
            }
          }
          return request;
        },
        responseSanitizer: (response) => {
          // Sanitize sensitive data from responses
          // Note: LogRocket expects body to be a string, so we sanitize at the string level
          if (response.body && typeof response.body === 'string') {
            try {
              const parsed = JSON.parse(response.body);
              if (parsed && typeof parsed === 'object') {
                if (parsed.token) parsed.token = '[REDACTED]';
                if (parsed.password) parsed.password = '[REDACTED]';
                return { ...response, body: JSON.stringify(parsed) };
              }
            } catch {
              // If not JSON, return as is
            }
          }
          return response;
        },
      },
      // Capture DOM mutations
      dom: {
        isEnabled: true,
        // Exclude sensitive input fields
        textSanitizer: true,
        inputSanitizer: true,
      },
      // Merge with other analytics
      mergeIframes: true,
    });

  }
}

/**
 * Identify user in LogRocket
 * Call this after user authentication
 */
export function identifyUser(
  userId: string,
  userData?: {
    [key: string]: string | number | boolean;
  }
) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    LogRocket.identify(userId, userData);
  }
}

/**
 * Clear user identification
 * Call this on logout
 */
export function clearUser() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    // LogRocket doesn't have clearUser, so we identify with empty data
    LogRocket.identify('', {});
  }
}

/**
 * Capture an exception manually
 */
export function captureException(
  error: Error,
  context?: {
    [tagName: string]: string | number | boolean;
  }
) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    LogRocket.captureException(error, {
      tags: context,
    });
  }
}

export default LogRocket;



