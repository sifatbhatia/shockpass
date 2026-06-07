'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
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

const posterPresets: string[] = [...POSTER_PRESETS]

const STEPS = ['Poster', 'Details', 'Tiers', 'Launch'] as const
const MIN_DESCRIPTION_LENGTH = 10
const MIN_TITLE_LENGTH = 3

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
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-tight mb-2">{COPY.openNewDrop}</h1>
          <p className="text-sm text-muted">Poster → Details → Tiers → Launch</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                i <= step ? 'bg-acid text-bg' : 'bg-panel-2 text-muted'
              )}>
                {i + 1}
              </div>
              <span className={cn('text-xs uppercase tracking-wider hidden sm:inline', i <= step ? 'text-text' : 'text-muted')}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Live preview */}
          <div className="sticky top-24">
            <Panel className="overflow-hidden">
              <div className="relative aspect-[4/5]">
                <Image src={form.posterUrl} alt="" fill unoptimized className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <p className="font-display text-3xl tracking-tight leading-tight">
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
          <div>
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
                  <FieldHint>Paste any image URL, or choose a Turnstile preset below.</FieldHint>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                      <Image src={poster} alt="" fill unoptimized className="object-cover" />
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
                  value={form.venueAddress}
                  onChange={(venueAddress) => setForm({ ...form, venueAddress })}
                  onSelect={(patch) => {
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
                <div>
                  <Label>Venue name *</Label>
                  <Input required value={form.venueName} onChange={e => setForm({ ...form, venueName: e.target.value })} placeholder="The Echo" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Starts *</Label><Input required type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></div>
                  <div><Label>Ends *</Label><Input required type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} /></div>
                </div>
                <div><Label>Capacity *</Label><Input required type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} mono /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">{COPY.firstTier}</h2>
                <div><Label>Tier name *</Label><Input required value={tierForm.name} onChange={e => setTierForm({ ...tierForm, name: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={tierForm.description} onChange={e => setTierForm({ ...tierForm, description: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Price ($) *</Label><Input required type="number" step="0.01" value={tierForm.priceDollars} onChange={e => setTierForm({ ...tierForm, priceDollars: parseFloat(e.target.value) || 0 })} mono /></div>
                  <div><Label>Qty *</Label><Input required type="number" value={tierForm.quantityTotal} onChange={e => setTierForm({ ...tierForm, quantityTotal: parseInt(e.target.value) || 0 })} mono /></div>
                  <div><Label>Max/order *</Label><Input required type="number" value={tierForm.maxPerOrder} onChange={e => setTierForm({ ...tierForm, maxPerOrder: parseInt(e.target.value) || 1 })} mono /></div>
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

            <div className="flex gap-3 mt-8">
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
