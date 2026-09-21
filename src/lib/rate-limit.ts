/** Tiny in-memory rate limit for public AI routes (best-effort on serverless). */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true };
}

export function clientKeyFromRequest(req: Request): string {
  const xf = req.headers.get('x-forwarded-for') || '';
  const ip = xf.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon';
  return ip;
}

export const MAX_ADVICE_CHARS = 12_000;
export const MAX_ANALYZE_CHARS = 20_000;
