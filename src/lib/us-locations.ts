import { State, City } from 'country-state-city'

export type USState = { code: string; name: string }

export const US_STATES: USState[] = State.getStatesOfCountry('US').map((s) => ({
  code: s.isoCode,
  name: s.name,
}))

export function getCitiesForState(stateCode: string): string[] {
  if (!stateCode) return []
  return City.getCitiesOfState('US', stateCode).map((c) => c.name)
}

export function formatDisplayCity(cityName: string, stateCode: string): string {
  return `${cityName}, ${stateCode}`
}

export function parseDisplayCity(display: string): { cityName: string; stateCode: string } | null {
  const match = display.match(/^(.+),\s*([A-Z]{2})$/)
  if (!match) return null
  return { cityName: match[1].trim(), stateCode: match[2] }
}

/** IANA timezone by US state (primary zone; multi-zone states use most populous) */
export const STATE_TIMEZONE: Record<string, string> = {
  AL: 'America/Chicago',
  AK: 'America/Anchorage',
  AZ: 'America/Phoenix',
  AR: 'America/Chicago',
  CA: 'America/Los_Angeles',
  CO: 'America/Denver',
  CT: 'America/New_York',
  DE: 'America/New_York',
  DC: 'America/New_York',
  FL: 'America/New_York',
  GA: 'America/New_York',
  HI: 'Pacific/Honolulu',
  ID: 'America/Boise',
  IL: 'America/Chicago',
  IN: 'America/Indiana/Indianapolis',
  IA: 'America/Chicago',
  KS: 'America/Chicago',
  KY: 'America/New_York',
  LA: 'America/Chicago',
  ME: 'America/New_York',
  MD: 'America/New_York',
  MA: 'America/New_York',
  MI: 'America/Detroit',
  MN: 'America/Chicago',
  MS: 'America/Chicago',
  MO: 'America/Chicago',
  MT: 'America/Denver',
  NE: 'America/Chicago',
  NV: 'America/Los_Angeles',
  NH: 'America/New_York',
  NJ: 'America/New_York',
  NM: 'America/Denver',
  NY: 'America/New_York',
  NC: 'America/New_York',
  ND: 'America/Chicago',
  OH: 'America/New_York',
  OK: 'America/Chicago',
  OR: 'America/Los_Angeles',
  PA: 'America/New_York',
  RI: 'America/New_York',
  SC: 'America/New_York',
  SD: 'America/Chicago',
  TN: 'America/Chicago',
  TX: 'America/Chicago',
  UT: 'America/Denver',
  VT: 'America/New_York',
  VA: 'America/New_York',
  WA: 'America/Los_Angeles',
  WV: 'America/New_York',
  WI: 'America/Chicago',
  WY: 'America/Denver',
}

export function timezoneForState(stateCode: string): string {
  return STATE_TIMEZONE[stateCode] ?? 'America/New_York'
}

const STATE_NAME_TO_CODE = Object.fromEntries(US_STATES.map((s) => [s.name.toLowerCase(), s.code]))

export function resolveStateCode(state?: string): string {
  if (!state) return ''
  if (state.length === 2) return state.toUpperCase()
  return STATE_NAME_TO_CODE[state.toLowerCase()] ?? ''
}
