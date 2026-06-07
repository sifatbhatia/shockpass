const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false
  bucket.count++
  return true
}

export function assertRateLimit(key: string, limit: number, windowMs: number, message = 'Too many requests') {
  if (!rateLimit(key, limit, windowMs)) {
    throw new Error(message)
  }
}
