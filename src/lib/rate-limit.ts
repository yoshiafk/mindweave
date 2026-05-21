import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ================================================
// Rate Limiting
// ================================================
// Uses local Docker Redis in development,
// Upstash Redis (Vercel KV) in production.
//
// Falls back to in-memory limiting if Redis
// is not configured (for quick local dev).
// ================================================

function getRedis(): Redis | undefined {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }

  return undefined;
}

const redis = getRedis();

/**
 * Login rate limiter: 5 attempts per 15 minutes per IP.
 * Returns null if Redis is not configured (no rate limiting in dev).
 */
export async function checkLoginRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number } | null> {
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:login",
  });

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}

/**
 * API rate limiter: 100 requests per 15 minutes per user.
 * Returns null if Redis is not configured.
 */
export async function checkApiRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number } | null> {
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "15 m"),
    prefix: "rl:api",
  });

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}

/**
 * AI rate limiter: 4 AI calls per week per user (from PRD).
 * Returns null if Redis is not configured.
 */
export async function checkAiRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number } | null> {
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(4, "7 d"),
    prefix: "rl:ai",
  });

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
