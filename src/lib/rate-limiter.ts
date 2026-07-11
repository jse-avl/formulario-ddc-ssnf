type Entry = {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

const FIVE_MIN = 5 * 60 * 1000

export function checkRateLimit(key: string, maxRequests: number, windowMs: number = FIVE_MIN): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count }
}
