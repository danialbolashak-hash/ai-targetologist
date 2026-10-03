import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight in-memory sliding-window rate limiter.
 * For production at scale, swap the Map for Upstash Redis (@upstash/ratelimit).
 * Sufficient to stop brute-force / API abuse on a single instance.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// periodic cleanup
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Returns null if allowed, or a 429 NextResponse if the limit is exceeded.
 * @param key unique key (e.g. `${ip}:${route}`)
 * @param limit max requests per window
 * @param windowMs window length in ms (default 60s)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): NextResponse | null {
  sweep();
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (b.count >= limit) {
    const retry = Math.ceil((b.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }

  b.count++;
  return null;
}
