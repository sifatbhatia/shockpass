import { describe, expect, it } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  it('blocks after limit exceeded', () => {
    const key = `test-${Date.now()}`
    expect(rateLimit(key, 2, 60_000)).toBe(true)
    expect(rateLimit(key, 2, 60_000)).toBe(true)
    expect(rateLimit(key, 2, 60_000)).toBe(false)
  })
})
