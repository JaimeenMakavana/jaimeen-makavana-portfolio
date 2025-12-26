/**
 * Analytics Rate Limiting Configuration
 * Aligned with GitHub Gist API and Vercel Free Tier limits
 */

import { checkRateLimit, getClientIdentifier, type RateLimitOptions } from "../jiva/rate-limit";

/**
 * Rate limit configurations
 * 
 * GitHub Gist API Limits:
 * - Authenticated: 5,000 requests/hour
 * - Unauthenticated: 60 requests/hour
 * 
 * Vercel Free Tier:
 * - 100,000 function invocations/month
 * - 10 second execution time
 * - 100 GB bandwidth/month
 */

// Per-IP rate limits for POST (tracking) requests
export const TRACKING_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 100, // 100 tracking requests per hour per IP
  windowMs: 60 * 60 * 1000, // 1 hour
};

// Per-IP rate limits for GET (admin) requests
export const ADMIN_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 300, // 300 admin requests per hour per IP
  windowMs: 60 * 60 * 1000, // 1 hour
};

// Global GitHub API rate limit (shared across all requests)
// We'll track this separately to ensure we don't exceed GitHub's limits
interface GitHubRateLimitStore {
  count: number;
  resetTime: number;
}

let githubRateLimit: GitHubRateLimitStore = {
  count: 0,
  resetTime: Date.now() + 60 * 60 * 1000, // 1 hour
};

/**
 * Check GitHub API rate limit (global, not per-IP)
 * GitHub allows 5,000 requests/hour for authenticated users
 * We'll be conservative and use 4,500 to leave buffer
 */
export function checkGitHubRateLimit(): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  
  // Reset if window expired
  if (githubRateLimit.resetTime < now) {
    githubRateLimit = {
      count: 0,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    };
  }

  // Conservative limit: 4,500 requests/hour (leaves 500 buffer)
  const MAX_REQUESTS = 4500;
  
  if (githubRateLimit.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: githubRateLimit.resetTime,
    };
  }

  // Increment and allow
  githubRateLimit.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - githubRateLimit.count,
    resetTime: githubRateLimit.resetTime,
  };
}

/**
 * Check per-IP rate limit for tracking requests
 */
export function checkTrackingRateLimit(request: Request): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const clientId = getClientIdentifier(request);
  return checkRateLimit(clientId, TRACKING_RATE_LIMIT);
}

/**
 * Check per-IP rate limit for admin requests
 */
export function checkAdminRateLimit(request: Request): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const clientId = getClientIdentifier(request);
  return checkRateLimit(clientId, ADMIN_RATE_LIMIT);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetTime),
    "Retry-After": String(Math.max(0, retryAfter)),
  };
}

