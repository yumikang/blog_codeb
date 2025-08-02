/**
 * Rate limiting utilities for API protection
 */

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Error message
  keyGenerator?: (request: Request) => string; // Function to generate key
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Get client identifier from request
 */
function getDefaultKey(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use the first available IP
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';
  
  // Include user agent for better fingerprinting
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent}`;
}

/**
 * Rate limiter middleware
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };
  const keyGenerator = options.keyGenerator || getDefaultKey;

  return {
    /**
     * Check if request should be rate limited
     */
    async check(request: Request): Promise<{ allowed: boolean; retryAfter?: number }> {
      const key = keyGenerator(request);
      const now = Date.now();
      
      // Get current rate limit data
      const rateLimit = rateLimitStore.get(key);
      
      if (!rateLimit || rateLimit.resetTime < now) {
        // Create new window
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + options.windowMs,
        });
        
        return { allowed: true };
      }
      
      // Check if limit exceeded
      if (rateLimit.count >= options.max) {
        const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
      }
      
      // Increment count
      rateLimit.count++;
      return { allowed: true };
    },
    
    /**
     * Update rate limit based on response status
     */
    async update(request: Request, status: number) {
      // Skip updating if configured
      if ((status < 400 && options.skipSuccessfulRequests) ||
          (status >= 400 && options.skipFailedRequests)) {
        return;
      }
      
      const key = keyGenerator(request);
      const rateLimit = rateLimitStore.get(key);
      
      // If request failed and we're not skipping failed requests,
      // we might want to be more strict
      if (status >= 400 && rateLimit && !options.skipFailedRequests) {
        // Double count for failed requests to prevent abuse
        rateLimit.count++;
      }
    },
    
    /**
     * Get rate limit headers for response
     */
    getHeaders(request: Request): Record<string, string> {
      const key = keyGenerator(request);
      const rateLimit = rateLimitStore.get(key);
      
      if (!rateLimit) {
        return {
          'X-RateLimit-Limit': String(options.max),
          'X-RateLimit-Remaining': String(options.max),
          'X-RateLimit-Reset': String(Date.now() + options.windowMs),
        };
      }
      
      const remaining = Math.max(0, options.max - rateLimit.count);
      
      return {
        'X-RateLimit-Limit': String(options.max),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(rateLimit.resetTime),
      };
    },
  };
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Strict limit for login attempts
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Only count failed attempts
  }),
  
  // Moderate limit for comment submissions
  comments: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 comments per hour
    message: 'Too many comments, please slow down.',
  }),
  
  // General API limit
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  }),
  
  // Search rate limit
  search: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: 'Too many search requests, please slow down.',
  }),
};