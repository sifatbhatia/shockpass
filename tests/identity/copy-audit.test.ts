import { describe, expect, it } from 'vitest'
import { COPY, GENERIC_BLOCKED } from '@/lib/copy'

describe('copy audit', () => {
  it('uses event-native primary CTAs', () => {
    expect(COPY.getTickets).toBe('Get tickets')
    expect(COPY.launchDrop).toBe('Launch a drop')
    expect(COPY.joinWaitlist).toBe('Join waitlist')
    expect(COPY.findTheDrop).toBe('Find the drop')
    expect(COPY.seeWhatsLive).toBe("See what's live")
    expect(COPY.commandCenter).toBe('Organizer hub')
    expect(COPY.joinTheRoom).toBe('Join the room')
  })

  it('does not use generic SaaS labels as primary CTAs', () => {
    const values = Object.values(COPY)
    for (const bad of GENERIC_BLOCKED) {
      expect(values).not.toContain(bad)
    }
  })

  it('has festival-native nav labels', () => {
    expect(COPY.commandCenter).not.toBe('Dashboard')
    expect(COPY.seeWhatsLive).not.toBe('Browse events')
    expect(COPY.findTheDrop).not.toBe('Discover events')
    expect(COPY.onSaleNow).toBe('On sale')
  })

  it('keeps homepage copy human and product-specific', () => {
    const visibleCopy = JSON.stringify(COPY)

    expect(visibleCopy).not.toMatch(/\bAI\b|generator|sell-through signal/i)
    expect(COPY.liveBoardHint).toContain('Ranked by demand')
  })
})
