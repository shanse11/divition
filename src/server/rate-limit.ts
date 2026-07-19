import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** 简单的内存滑动窗口频率限制(单实例部署适用) */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

// 定期清理过期的桶,避免内存膨胀
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();
export function cleanupBuckets(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
