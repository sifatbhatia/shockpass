import { createHash, randomBytes } from 'crypto'

export function generateIdempotencyKey(): string {
  return `idem_${randomBytes(16).toString('hex')}`
}

export function generateQRToken(): string {
  return `qrt_${randomBytes(24).toString('base64url')}`
}

export function generateTransferToken(): string {
  return `xfr_${randomBytes(16).toString('hex')}`
}

export function hashQRToken(token: string): string {
  const secret = process.env.QR_ROTATION_SECRET || 'dev-secret'
  return createHash('sha256').update(`${token}.${secret}`).digest('hex')
}

export function verifyQRToken(token: string, hash: string): boolean {
  return hashQRToken(token) === hash
}

export function generateRotatingQRToken(ticketId: string, timestamp: number): string {
  const secret = process.env.QR_ROTATION_SECRET || 'dev-secret'
  const interval = parseInt(process.env.QR_ROTATION_INTERVAL_SECONDS || '30', 10)
  const window = Math.floor(timestamp / 1000 / interval)
  const data = `${ticketId}.${window}.${secret}`
  return createHash('sha256').update(data).digest('hex').slice(0, 32)
}

export function verifyRotatingQRToken(ticketId: string, token: string, timestamp: number, tolerance = 1): boolean {
  const interval = parseInt(process.env.QR_ROTATION_INTERVAL_SECONDS || '30', 10)
  const window = Math.floor(timestamp / 1000 / interval)

  for (let i = -tolerance; i <= tolerance; i++) {
    const expected = generateRotatingQRToken(ticketId, (window + i) * interval * 1000)
    if (expected === token) return true
  }
  return false
}