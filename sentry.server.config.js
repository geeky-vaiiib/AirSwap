// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Enhanced Sentry Configuration for Production Security and Monitoring
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Production performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Error sample rate - capture all errors in production
  sampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.5,

  // Debug mode only in development
  debug: process.env.NODE_ENV === 'development',

  // Enhanced replay configuration for production debugging
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,

  // Enhanced error filtering and security
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly configured
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_ERRORS) {
      return null;
    }

    // Sanitize sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers['x-api-key'];
        delete event.request.headers.cookie;
      }

      // Sanitize URLs that might contain sensitive data
      if (event.request.url) {
        // Remove query parameters that might contain tokens or secrets
        try {
          const url = new URL(event.request.url);
          const paramsToRemove = ['token', 'api_key', 'secret', 'password', 'key'];
          paramsToRemove.forEach(param => url.searchParams.delete(param));
          event.request.url = url.toString();
        } catch (e) {
          // If URL parsing fails, just remove the entire URL
          delete event.request.url;
        }
      }
    }

    // Sanitize user data
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
    }

    // Add custom fingerprinting for common errors
    if (event.exception) {
      const error = hint?.originalException;
      if (error && typeof error === 'object') {
        const message = error.message || '';

        // Group authentication errors together
        if (message.includes('JWT') || message.includes('token') || message.includes('auth')) {
          event.fingerprint = ['authentication-error'];
        }

        // Group rate limiting errors
        if (message.includes('rate limit') || message.includes('too many requests')) {
          event.fingerprint = ['rate-limit-error'];
        }

        // Group database errors (without exposing details)
        if (message.includes('MongoDB') || message.includes('database')) {
          event.fingerprint = ['database-error'];
        }
      }
    }

    return event;
  },

  // Enhanced error ignore list for production
  ignoreErrors: [
    // Browser extensions and development tools
    'top.GLOBALS',
    'webkitStorageInfo',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',

    // Network issues that aren't our fault
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'AbortError',
    'TypeError: Failed to fetch',

    // React development warnings
    'Warning: React.jsx',
    'Warning: Each child in a list should have a unique "key"',

    // Leaflet errors (map library)
    'Uncaught TypeError: Cannot read property',
  ],

  // Ignore specific URLs
  denyUrls: [
    // External analytics and widgets
    /googletagmanager\.com/i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
    /facebook\.com/i,
    /connect\.facebook\.net/i,

    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    /^chrome-extension:\/\//i,
  ],

  // Security-focused configuration
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'unknown',

  // Performance monitoring settings
  enableTracing: true,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.1,

  // Health check endpoint filtering
  integrations: [
    new Sentry.Integrations.Http(),
    new Sentry.Integrations.Console(),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],

  // Production-specific settings
  ...(process.env.NODE_ENV === 'production' && {
    // Send PII (only in production with consent)
    sendDefaultPii: false,

    // Capture context for better debugging
    attachStacktrace: true,
    captureUnhandledRejections: true,

    // Performance profiling
    profilesSampleRate: 0.05,
  }),
});
