/**
 * Security utilities for the application
 */

/**
 * Generate Content Security Policy header
 */
export function getSecurityHeaders() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: Allow self, inline scripts (for now), and specific CDNs
    `script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ''} https://cdn.jsdelivr.net`,
    // Styles: Allow self, inline styles, and fonts.googleapis.com
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Images: Allow self, data URLs, and Supabase storage
    `img-src 'self' data: https: ${process.env.SUPABASE_URL || ''}`,
    // Fonts: Allow self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Connect: Allow self and Supabase
    `connect-src 'self' ${process.env.SUPABASE_URL || ''} wss://*.supabase.co`,
    // Media: Allow self
    "media-src 'self'",
    // Frame ancestors: Prevent clickjacking
    "frame-ancestors 'none'",
    // Base URI: Restrict base tag
    "base-uri 'self'",
    // Form action: Restrict form submissions
    "form-action 'self'",
    // Upgrade insecure requests in production
    !isDevelopment ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join('; ');

  return {
    // Security headers
    'Content-Security-Policy': cspDirectives,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // HSTS (only in production)
    ...(isDevelopment ? {} : {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    })
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}