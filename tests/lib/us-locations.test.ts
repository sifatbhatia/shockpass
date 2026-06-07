import { describe, expect, it } from 'vitest'
import {
  US_STATES,
  formatDisplayCity,
  getCitiesForState,
  parseDisplayCity,
  resolveStateCode,
  timezoneForState,
} from '@/lib/us-locations'

describe('us-locations', () => {
  it('includes 50 states plus DC', () => {
    expect(US_STATES.length).toBeGreaterThanOrEqual(51)
  })

  it('returns cities for a known state', () => {
    const cities = getCitiesForState('CA')
    expect(cities.length).toBeGreaterThan(0)
    expect(cities).toContain('Los Angeles')
  })

  it('formats and parses display city', () => {
    const display = formatDisplayCity('Austin', 'TX')
    expect(display).toBe('Austin, TX')
    expect(parseDisplayCity(display)).toEqual({ cityName: 'Austin', stateCode: 'TX' })
  })

  it('resolves full state names to codes', () => {
    expect(resolveStateCode('California')).toBe('CA')
    expect(resolveStateCode('NY')).toBe('NY')
  })

  it('maps state to timezone', () => {
    expect(timezoneForState('CA')).toBe('America/Los_Angeles')
    expect(timezoneForState('NY')).toBe('America/New_York')
  })
})
