import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { resolveStateCode } from '@/lib/us-locations'

export type GeocodeResult = {
  label: string
  venueAddress: string
  venueName: string | null
  city: string
  stateCode: string
  lat: number
  lng: number
}

function normalizeResult(item: {
  display_name: string
  lat: string
  lon: string
  address?: Record<string, string>
  namedetails?: Record<string, string>
}): GeocodeResult | null {
  const addr = item.address ?? {}
  const namedetails = item.namedetails ?? {}
  const stateCode = resolveStateCode(addr.state)

  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.hamlet ||
    addr.municipality ||
    ''

  const street = [addr.house_number, addr.road].filter(Boolean).join(' ')
  const venueAddress = street || item.display_name.split(',')[0]?.trim() || ''
  const venueName =
    namedetails.name ||
    addr.name ||
    addr.amenity ||
    addr.tourism ||
    addr.leisure ||
    addr.office ||
    addr.building ||
    addr.shop ||
    addr.craft ||
    null

  if (!city && !stateCode) return null

  const resolvedState = stateCode ?? ''
  const displayCity = city && resolvedState ? `${city}, ${resolvedState}` : city

  return {
    label: item.display_name,
    venueAddress,
    venueName,
    city: displayCity,
    stateCode: resolvedState,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon'
  if (!rateLimit(`geocode:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
  }

  const userAgent = process.env.NOMINATIM_USER_AGENT ?? 'Willcall/1.0 (willcall.app)'

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('namedetails', '1')
    url.searchParams.set('countrycodes', 'us')
    url.searchParams.set('limit', '8')

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Address lookup unavailable' }, { status: 502 })
    }

    const data = (await res.json()) as Array<{
      display_name: string
      lat: string
      lon: string
      address?: Record<string, string>
      namedetails?: Record<string, string>
    }>

    const results = data.map(normalizeResult).filter((r): r is GeocodeResult => r !== null)

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Address lookup failed' }, { status: 502 })
  }
}
