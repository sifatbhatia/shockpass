'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CalendarDays, Clock } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldHint } from '@/components/ui/Input'
import { Panel } from '@/components/ui/Panel'
import { COPY } from '@/lib/copy'
import { trpc } from '@/trpc/client'
import toast from 'react-hot-toast'
import { timezoneForState } from '@/lib/us-locations'
import { cn } from '@/lib/cn'
import { USAddressAutocomplete } from '@/components/forms/USAddressAutocomplete'
import {
  USStateCitySelect,
  emptyUSLocation,
  type USLocationValue,
} from '@/components/forms/USStateCitySelect'
import { POSTER_PRESETS } from '@/lib/poster-assets'
import { EventPoster } from '@/components/EventPoster'

const posterPresets: string[] = [...POSTER_PRESETS]

const STEPS = ['Poster', 'Details', 'Tiers', 'Launch'] as const
const MIN_DESCRIPTION_LENGTH = 10
const MIN_TITLE_LENGTH = 3

type ScheduleFieldProps = {
  label: string
  type: 'date' | 'time'
  value: string
  onChange: (value: string) => void
}

function ScheduleField({ label, type, value, onChange }: ScheduleFieldProps) {
  const Icon = type === 'date' ? CalendarDays : Clock

  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <div className="group relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-acid"
          strokeWidth={1.7}
          aria-hidden
        />
        <Input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="date-time-control h-12 rounded-pass border-white/12 bg-bg/70 pl-10 pr-3 font-mono text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        />
      </div>
    </div>
  )
}

function formatCreateDropError(err: unknown): string {
  if (!(err instanceof Error)) return 'Could not create drop'
  try {
    const parsed = JSON.parse(err.message) as Array<{ path?: string[]; message?: string }>
    if (Array.isArray(parsed) && parsed[0]?.message) {
      const field = parsed[0].path?.join('.') ?? 'field'
      return `${field}: ${parsed[0].message}`
    }
  } catch {
    /* not JSON */
  }
  return err.message || 'Could not create drop'
}

function datePart(value: string) {
  return value ? value.slice(0, 10) : ''
}

function timePart(value: string) {
  return value ? value.slice(11, 16) : ''
}

function mergeDateTime(value: string, part: 'date' | 'time', next: string) {
  const date = part === 'date' ? next : datePart(value)
  const time = part === 'time' ? next : timePart(value)
  return date && time ? `${date}T${time}` : ''
}

export default function CreateEventPage() {
  const router = useRouter()
  const { status } = useSession()
  const utils = trpc.useUtils()
  const [step, setStep] = useState(0)

  const createEvent = trpc.event.create.useMutation()
  const createTier = trpc.ticket.create.useMutation()
  const openSales = trpc.ticket.openSales.useMutation()
  const goLive = trpc.event.goLive.useMutation()

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    posterUrl: posterPresets[0],
    venueName: '',
    venueAddress: '',
    city: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startsAt: '',
    endsAt: '',
    capacity: 500,
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  })
  const [venueSearch, setVenueSearch] = useState('')
  const [location, setLocation] = useState<USLocationValue>(emptyUSLocation())
  const [tierForm, setTierForm] = useState({
    name: 'General Admission',
    description: 'Entry for one attendee',
    priceDollars: 45,
    quantityTotal: 250,
    maxPerOrder: 6,
  })
  const [launchNow, setLaunchNow] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth?tab=signup')
  }, [status, router])

  const handleSubmit = async () => {
    const description = form.description.trim()
    if (description.length < MIN_DESCRIPTION_LENGTH) {
      toast.error(`Description needs at least ${MIN_DESCRIPTION_LENGTH} characters (${description.length}/${MIN_DESCRIPTION_LENGTH})`)
      setStep(1)
      return
    }
    if (form.title.trim().length < MIN_TITLE_LENGTH) {
      toast.error(`Title needs at least ${MIN_TITLE_LENGTH} characters`)
      setStep(1)
      return
    }

    try {
      const event = await createEvent.mutateAsync({
        ...form,
        title: form.title.trim(),
        description,
        subtitle: form.subtitle.trim() || undefined,
        city: location.displayCity || form.city,
        capacity: Number(form.capacity),
        startsAt: new Date(form.startsAt),
        endsAt: new Date(form.endsAt),
        lat: form.lat,
        lng: form.lng,
      })

      const tier = await createTier.mutateAsync({
        eventId: event.id,
        name: tierForm.name,
        description: tierForm.description,
        priceCents: Math.round(Number(tierForm.priceDollars) * 100),
        quantityTotal: Number(tierForm.quantityTotal),
        maxPerOrder: Number(tierForm.maxPerOrder),
      })

      if (launchNow) {
        await openSales.mutateAsync({ id: tier.id })
        await goLive.mutateAsync({ id: event.id })
      }

      await utils.event.myEvents.invalidate()
      toast.success(launchNow ? 'Drop launched' : 'Draft saved')
      router.push(`/dashboard/events/${event.id}`)
    } catch (err) {
      toast.error(formatCreateDropError(err))
    }
  }

  const descriptionLength = form.description.trim().length
  const descriptionValid = descriptionLength >= MIN_DESCRIPTION_LENGTH
  const titleValid = form.title.trim().length >= MIN_TITLE_LENGTH

  const isSubmitting = createEvent.isPending || createTier.isPending || openSales.isPending || goLive.isPending

  const canNext =
    step === 0 ? !!form.posterUrl :
    step === 1
      ? titleValid &&
        descriptionValid &&
        form.venueName.trim().length >= 2 &&
        location.displayCity.length >= 2 &&
        form.venueAddress.trim().length >= 5 &&
        form.startsAt &&
        form.endsAt
      :
    step === 2 ? tierForm.name && tierForm.priceDollars > 0 :
    true

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-4xl tracking-tight mb-2 sm:text-5xl">{COPY.openNewDrop}</h1>
          <p className="text-sm text-muted">Poster → Details → Tiers → Launch</p>
        </div>

        {/* Stepper */}
        <div className="mb-8 grid grid-cols-4 gap-2 sm:mb-10 sm:flex sm:items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="min-w-0 sm:flex sm:flex-1 sm:items-center sm:gap-2">
              <div className={cn(
                'mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:mx-0',
                i <= step ? 'bg-acid text-bg' : 'bg-panel-2 text-muted'
              )}>
                {i + 1}
              </div>
              <span className={cn('mt-2 block truncate text-center text-[10px] uppercase tracking-wider sm:mt-0 sm:text-left sm:text-xs', i <= step ? 'text-text' : 'text-muted')}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="mx-2 hidden h-px flex-1 bg-border sm:block" />}
            </div>
          ))}
        </div>

        <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)] md:gap-10">
          {/* Live preview */}
          <div className="min-w-0 md:sticky md:top-24">
            <Panel className="overflow-hidden">
              <div className="relative aspect-[16/10] md:aspect-[4/5]">
                <EventPoster src={form.posterUrl} title={form.title || 'Your drop title'} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                <div className="absolute bottom-0 p-4 sm:p-6">
                  <p className="font-display text-2xl tracking-tight leading-tight sm:text-3xl">
                    {form.title || 'Your drop title'}
                  </p>
                  {form.subtitle && <p className="text-sm text-muted mt-2">{form.subtitle}</p>}
                  {location.displayCity && <p className="text-xs font-mono text-muted mt-3">{form.venueName || 'Venue'} · {location.displayCity}</p>}
                  {tierForm.name && (
                    <p className="mt-4 inline-block rounded-full border border-acid/40 bg-acid/10 px-3 py-1 text-xs font-mono text-acid">
                      {tierForm.name} · ${tierForm.priceDollars}
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* Step content */}
          <div className="min-w-0">
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">{COPY.pickPoster}</h2>
                <div>
                  <Label>Custom poster URL</Label>
                  <Input
                    value={form.posterUrl}
                    onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                    placeholder="https://images.yourdomain.com/poster.jpg"
                  />
                  <FieldHint>Paste any image URL, or choose a Willcall preset below.</FieldHint>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
                  {posterPresets.map((poster) => (
                    <button
                      key={poster}
                      type="button"
                      onClick={() => setForm({ ...form, posterUrl: poster })}
                      className={cn(
                        'relative aspect-[4/3] overflow-hidden rounded-pass border',
                        form.posterUrl === poster ? 'border-acid shadow-glow-acid' : 'border-border'
                      )}
                    >
                      <EventPoster src={poster} title="Poster preset" className="absolute inset-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">{COPY.dropDetails}</h2>
                <div>
                  <Label>Title *</Label>
                  <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Neon District Block Party" />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                </div>
                <div>
                  <Label>Description *</Label>
                  <textarea
                    required
                    rows={4}
                    minLength={MIN_DESCRIPTION_LENGTH}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What makes this drop worth showing up for? Lineup, vibe, doors, age policy…"
                    className={cn(
                      'w-full rounded-drop border bg-panel-2 px-4 py-3 text-sm resize-none focus:outline-none focus-ring',
                      descriptionLength > 0 && !descriptionValid
                        ? 'border-danger/60 focus:border-danger/60'
                        : 'border-border focus:border-acid/45'
                    )}
                  />
                  <FieldHint error={descriptionLength > 0 && !descriptionValid}>
                    {descriptionValid
                      ? `${descriptionLength} characters`
                      : `At least ${MIN_DESCRIPTION_LENGTH} characters (${descriptionLength}/${MIN_DESCRIPTION_LENGTH})`}
                  </FieldHint>
                </div>
                <USAddressAutocomplete
                  label="Venue search *"
                  placeholder="Search by venue name or street address..."
                  value={venueSearch}
                  onChange={(value) => {
                    const previousSearch = venueSearch
                    setVenueSearch(value)
                    setForm((f) => ({
                      ...f,
                      venueName: f.venueName.trim().length === 0 || f.venueName === previousSearch ? value : f.venueName,
                    }))
                  }}
                  onSelect={(patch) => {
                    setVenueSearch(patch.venueName || patch.venueAddress)
                    setForm((f) => ({
                      ...f,
                      venueAddress: patch.venueAddress,
                      venueName: patch.venueName ?? f.venueName,
                      city: patch.city,
                      lat: patch.lat,
                      lng: patch.lng,
                      timezone: patch.timezone ?? f.timezone,
                    }))
                    setLocation(patch.location)
                  }}
                />
                <FieldHint>Pick a venue suggestion to fill address, city, timezone, and coordinates.</FieldHint>
                <div>
                  <Label>Venue name *</Label>
                  <Input required value={form.venueName} onChange={e => setForm({ ...form, venueName: e.target.value })} placeholder="The Echo" />
                </div>
                <div>
                  <Label>Street address *</Label>
                  <Input
                    required
                    value={form.venueAddress}
                    onChange={e => setForm({ ...form, venueAddress: e.target.value })}
                    placeholder="1822 Sunset Blvd"
                  />
                  <FieldHint>Auto-filled from venue search when available. You can edit it before launch.</FieldHint>
                </div>
                <USStateCitySelect
                  required
                  value={location}
                  onChange={(loc) => {
                    setLocation(loc)
                    setForm((f) => ({
                      ...f,
                      city: loc.displayCity,
                      timezone: loc.stateCode ? timezoneForState(loc.stateCode) : f.timezone,
                    }))
                  }}
                />
                <div className="grid min-w-0 gap-3 rounded-pass border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(248,214,247,0.08),transparent_34%),rgba(255,255,255,0.035)] p-3 shadow-panel sm:grid-cols-2 sm:gap-4 sm:p-4">
                  <div className="sm:col-span-2">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-acid">Schedule</p>
                    <p className="mt-1 text-xs text-muted">Separate door date and time. Timezone follows the selected city.</p>
                  </div>
                  <ScheduleField
                    label="Start date *"
                    type="date"
                    value={datePart(form.startsAt)}
                    onChange={(value) => setForm({ ...form, startsAt: mergeDateTime(form.startsAt, 'date', value) })}
                  />
                  <ScheduleField
                    label="Start time *"
                    type="time"
                    value={timePart(form.startsAt)}
                    onChange={(value) => setForm({ ...form, startsAt: mergeDateTime(form.startsAt, 'time', value) })}
                  />
                  <ScheduleField
                    label="End date *"
                    type="date"
                    value={datePart(form.endsAt)}
                    onChange={(value) => setForm({ ...form, endsAt: mergeDateTime(form.endsAt, 'date', value) })}
                  />
                  <ScheduleField
                    label="End time *"
                    type="time"
                    value={timePart(form.endsAt)}
                    onChange={(value) => setForm({ ...form, endsAt: mergeDateTime(form.endsAt, 'time', value) })}
                  />
                  <p className="min-w-0 break-words rounded-drop border border-white/10 bg-bg/50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:col-span-2">
                    Timezone: <span className="text-text">{form.timezone}</span>
                  </p>
                </div>
                <div><Label>Capacity *</Label><Input required type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} mono /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">{COPY.firstTier}</h2>
                <div><Label>Tier name *</Label><Input required value={tierForm.name} onChange={e => setTierForm({ ...tierForm, name: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={tierForm.description} onChange={e => setTierForm({ ...tierForm, description: e.target.value })} /></div>
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  <div className="min-w-0"><Label>Price ($) *</Label><Input required type="number" step="0.01" value={tierForm.priceDollars} onChange={e => setTierForm({ ...tierForm, priceDollars: parseFloat(e.target.value) || 0 })} mono /></div>
                  <div className="min-w-0"><Label>Qty *</Label><Input required type="number" value={tierForm.quantityTotal} onChange={e => setTierForm({ ...tierForm, quantityTotal: parseInt(e.target.value) || 0 })} mono /></div>
                  <div className="min-w-0"><Label>Max/order *</Label><Input required type="number" value={tierForm.maxPerOrder} onChange={e => setTierForm({ ...tierForm, maxPerOrder: parseInt(e.target.value) || 1 })} mono /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">{COPY.readyToLaunch}</h2>
                <Panel className="p-5 space-y-2 text-sm">
                  <p><span className="text-muted">Event:</span> {form.title}</p>
                  <p><span className="text-muted">Tier:</span> {tierForm.name} · ${tierForm.priceDollars} · {tierForm.quantityTotal} tickets</p>
                </Panel>
                <label className="flex items-center justify-between rounded-pass border border-border bg-panel px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold">Launch on sale now</span>
                    <span className="block text-xs text-muted">Open sales and show in discovery immediately.</span>
                  </span>
                  <input type="checkbox" checked={launchNow} onChange={e => setLaunchNow(e.target.checked)} className="h-5 w-5 accent-acid" />
                </label>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button className="flex-1" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button>
              ) : (
                <Button className="flex-1" disabled={isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? 'Launching...' : launchNow ? COPY.launchDrop : 'Save draft'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
