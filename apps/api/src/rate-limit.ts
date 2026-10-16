export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit = 120,
    private readonly windowMs = 60_000
  ) {}

  consume(key: string, now = Date.now()): RateLimitResult {
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: Math.max(0, this.limit - 1), retryAfterSeconds: 0 };
    }

    if (current.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
      };
    }

    current.count += 1;
    return { allowed: true, remaining: this.limit - current.count, retryAfterSeconds: 0 };
  }

  prune(now = Date.now()): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
