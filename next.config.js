/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Security headers configuration
 * These headers help protect against common web vulnerabilities
 */
const securityHeaders = [
  {
    // Prevent clickjacking attacks
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Enable XSS filter in browsers
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Permissions Policy (formerly Feature-Policy)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  {
    // Enhanced Content Security Policy for production security
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io", // Required for Next.js + Sentry
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow Google Fonts
      "img-src 'self' data: https: blob: https://*.mapbox.com https://*.tile.openstreetmap.org", // Maps and image uploads
      "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts
      "media-src 'self' data: blob:", // File uploads
      "connect-src 'self' https://*.mongodb.net wss://*.mongodb.net https://*.sentry.io https://api.sentry.io",
      "frame-ancestors 'none'", // Prevent embedding
      "frame-src 'none'", // Prevent iframes entirely
      "object-src 'none'", // Block plugins
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests", // Force HTTPS
      "block-all-mixed-content", // Prevent mixed HTTP/HTTPS
    ].join('; '),
  },
];

// Add HSTS only in production
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    // HTTP Strict Transport Security
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  });
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./"),
    };
    return config;
  },

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
