import { describe, expect, it } from 'vitest'
import {
  generateQRToken,
  generateRotatingQRToken,
  hashQRToken,
  verifyQRToken,
  verifyRotatingQRToken,
} from './crypto'

describe('crypto', () => {
  it('generates unique QR tokens', () => {
    const a = generateQRToken()
    const b = generateQRToken()
    expect(a).not.toBe(b)
    expect(a.startsWith('qrt_')).toBe(true)
  })

  it('hashes and verifies QR tokens without storing raw token as id', () => {
    const token = generateQRToken()
    const hash = hashQRToken(token)
    expect(hash).not.toContain(token)
    expect(verifyQRToken(token, hash)).toBe(true)
    expect(verifyQRToken('wrong', hash)).toBe(false)
  })

  it('rotates QR tokens per time window', () => {
    process.env.QR_ROTATION_INTERVAL_SECONDS = '30'
    const ticketId = 'ticket_test_123'
    const t = 1_700_000_000_000
    const token = generateRotatingQRToken(ticketId, t)
    expect(verifyRotatingQRToken(ticketId, token, t)).toBe(true)
    expect(verifyRotatingQRToken(ticketId, token, t + 120_000)).toBe(false)
  })
})
