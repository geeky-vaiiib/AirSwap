import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Security Headers and Meta Tags */}
        <meta httpEquiv="X-Content-Security-Policy" content="default-src 'self'" />
        <meta httpEquiv="X-WebKit-CSP" content="default-src 'self'" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Prevent caching of sensitive content */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* Character encoding */}
        <meta charSet="utf-8" />

        {/* Prevent clickjacking */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />

        {/* Prevent MIME type sniffing */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />

        {/* XSS protection */}
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Robots for production security */}
        {process.env.NODE_ENV === 'production' && (
          <meta name="robots" content="noindex, nofollow, noarchive" />
        )}

        {/* Viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Theme color */}
        <meta name="theme-color" content="#0f766e" />

        {/* Application manifest (commented out until we create one) */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
