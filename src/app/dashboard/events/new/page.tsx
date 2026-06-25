'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight,
  Check, Plus, X, Copy, Trash2, AlertCircle,
  ChevronDown,
} from 'lucide-react'
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
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  parse,
  addHours,
  differenceInMinutes,
} from 'date-fns'

const posterPresets: string[] = [...POSTER_PRESETS]
const STEPS = ['Poster', 'Details', 'Tiers', 'Launch'] as const
const MIN_DESCRIPTION_LENGTH = 10
const MIN_TITLE_LENGTH = 3

// 15-minute time slots for the picker
const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4)
  const m = (i % 4) * 15
  const date = new Date(2000, 0, 1, h, m)
  return {
    value: format(date, 'HH:mm'),
    label: format(date, 'h:mm a'),
  }
})

// ─── Date Picker ───────────────────────────────────────────────────────

function DatePicker({
  value,
  onChange,
  label,
  minDate,
}: {
  value: string // YYYY-MM-DD
  onChange: (v: string) => void
  label: string
  minDate?: Date
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() =>
    value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date()
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const days = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [month])

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-drop border bg-panel-2 px-3 text-sm transition-colors focus-ring',
          open ? 'border-acid/45' : 'border-border',
          value ? 'text-text' : 'text-muted/80'
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.7} />
        <span className="flex-1 text-left">
          {value
            ? format(parse(value, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')
            : 'Pick a date'}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-muted transition-transform', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-40 mt-1.5 w-[300px] rounded-drop border border-border bg-panel p-3 shadow-panel animate-fade-up">
            {/* Month nav */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth(subMonths(month, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-panel-2 hover:text-text transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="text-sm font-semibold">{format(month, 'MMMM yyyy')}</span>
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-panel-2 hover:text-text transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Day headers */}
            <div className="mb-1 grid grid-cols-7">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div
                  key={d}
                  className="flex h-8 items-center justify-center text-[10px] font-medium uppercase tracking-wider text-muted"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const sameMonth = isSameMonth(day, month)
                const selected = selectedDate && isSameDay(day, selectedDate)
                const today = isToday(day)
                const disabled = minDate ? isBefore(day, startOfDay(minDate)) : false
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled || !sameMonth}
                    onClick={() => {
                      onChange(format(day, 'yyyy-MM-dd'))
                      setOpen(false)
                    }}
                    className={cn(
                      'relative flex h-9 w-full items-center justify-center rounded-full text-xs transition-colors',
                      !sameMonth && 'text-transparent pointer-events-none',
                      disabled && 'text-muted-deep cursor-not-allowed',
                      !disabled && sameMonth && 'hover:bg-panel-2',
                      selected && 'bg-acid text-bg font-bold hover:bg-acid-dim shadow-glow-acid',
                      !selected && today && sameMonth && 'font-bold text-acid'
                    )}
                  >
                    {format(day, 'd')}
                    {today && sameMonth && !selected && (
                      <span className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-acid" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Time Picker ───────────────────────────────────────────────────────

function TimePicker({
  value,
  onChange,
  label,
}: {
  value: string // HH:mm
  onChange: (v: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Derived display label for the input
  const displayLabel = useMemo(() => {
    if (!value) return ''
    try {
      const d = parse(value, 'HH:mm', new Date(2000, 0, 1))
      return format(d, 'h:mm a')
    } catch {
      return value
    }
  }, [value])

  const [inputValue, setInputValue] = useState(displayLabel)

  useEffect(() => {
    setInputValue(displayLabel)
  }, [displayLabel])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll to selected time when opening
  useEffect(() => {
    if (open && value && listRef.current) {
      const idx = TIME_SLOTS.findIndex((s) => s.value === value)
      if (idx >= 0) {
        const el = listRef.current.children[idx] as HTMLElement
        el?.scrollIntoView({ block: 'center' })
      }
    }
  }, [open, value])

  const tryParseInput = (raw: string) => {
    const patterns = ['h:mm a', 'h:mma', 'HH:mm', 'h a', 'ha']
    for (const p of patterns) {
      try {
        const d = parse(raw.toUpperCase(), p, new Date(2000, 0, 1))
        if (!isNaN(d.getTime())) return d
      } catch {
        /* try next */
      }
    }
    return null
  }

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <Label>{label}</Label>
      <div className="relative">
        <Clock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.7}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            const raw = e.target.value
            setInputValue(raw)
            const parsed = tryParseInput(raw)
            if (parsed) onChange(format(parsed, 'HH:mm'))
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setInputValue(displayLabel)}
          placeholder="Select time"
          className={cn(
            'h-11 w-full rounded-drop border bg-panel-2 pl-10 pr-9 text-sm text-text placeholder:text-muted/60 transition-colors focus-ring',
            open ? 'border-acid/45' : 'border-border'
          )}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text"
        >
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
            strokeWidth={2}
          />
        </button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            ref={listRef}
            className="absolute left-0 top-full z-40 mt-1.5 max-h-[200px] w-full overflow-y-auto rounded-drop border border-border bg-panel p-1 shadow-panel animate-fade-up"
          >
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => {
                  onChange(slot.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-1.5 text-sm transition-colors',
                  slot.value === value
                    ? 'bg-acid/12 text-acid font-medium'
                    : 'text-muted hover:bg-panel-2 hover:text-text'
                )}
              >
                {slot.label}
                {slot.value === value && (
                  <Check className="ml-auto h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Schedule Section ──────────────────────────────────────────────────

function ScheduleSection({
  schedule,
  onChange,
  timezone,
}: {
  schedule: { startDate: string; startTime: string; endDate: string; endTime: string }
  onChange: (s: typeof schedule) => void
  timezone: string
}) {
  const today = new Date()

  const startDT =
    schedule.startDate && schedule.startTime
      ? parse(`${schedule.startDate}T${schedule.startTime}`, "yyyy-MM-dd'T'HH:mm", new Date())
      : null
  const endDT =
    schedule.endDate && schedule.endTime
      ? parse(`${schedule.endDate}T${schedule.endTime}`, "yyyy-MM-dd'T'HH:mm", new Date())
      : null

  const warnings: string[] = []
  if (startDT && endDT) {
    const diffMin = differenceInMinutes(endDT, startDT)
    if (diffMin < 0) warnings.push('End must be after start')
    else if (diffMin < 30) warnings.push('Duration under 30 minutes — very short!')
    else if (diffMin > 24 * 60) warnings.push('Duration over 24 hours — double-check this')
  }

  const handleField = (field: keyof typeof schedule, val: string) => {
    const next = { ...schedule, [field]: val }
    // Auto-fill end to start + 3h when start is set and end is empty
    if ((field === 'startDate' || field === 'startTime') && next.startDate && next.startTime) {
      if (!next.endDate || !next.endTime) {
        const parsed = parse(`${next.startDate}T${next.startTime}`, "yyyy-MM-dd'T'HH:mm", new Date())
        if (!isNaN(parsed.getTime())) {
          const threeH = addHours(parsed, 3)
          next.endDate = format(threeH, 'yyyy-MM-dd')
          next.endTime = format(threeH, 'HH:mm')
        }
      }
    }
    onChange(next)
  }

  return (
    <div className="rounded-pass border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(248,214,247,0.08),transparent_34%),rgba(255,255,255,0.035)] p-3 shadow-panel sm:p-4">
      <div className="mb-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-acid">Schedule</p>
        <p className="mt-0.5 text-xs text-muted">Timezone follows the selected city.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <DatePicker
          label="Start date *"
          value={schedule.startDate}
          onChange={(v) => handleField('startDate', v)}
          minDate={today}
        />
        <TimePicker
          label="Start time *"
          value={schedule.startTime}
          onChange={(v) => handleField('startTime', v)}
        />
        <DatePicker
          label="End date *"
          value={schedule.endDate}
          onChange={(v) => handleField('endDate', v)}
          minDate={schedule.startDate ? parse(schedule.startDate, 'yyyy-MM-dd', new Date()) : today}
        />
        <TimePicker
          label="End time *"
          value={schedule.endTime}
          onChange={(v) => handleField('endTime', v)}
        />
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {w}
            </p>
          ))}
        </div>
      )}

      <p className="mt-3 min-w-0 break-words rounded-drop border border-white/10 bg-bg/50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        Timezone: <span className="text-text">{timezone}</span>
      </p>
    </div>
  )
}

// ─── Tier helpers ──────────────────────────────────────────────────────

interface TierEntry {
  id: string
  name: string
  description: string
  priceDollars: number
  quantityTotal: number
  maxPerOrder: number
}

let tierCounter = 0
function freshTier(overrides?: Partial<TierEntry>): TierEntry {
  return {
    id: `tier-${++tierCounter}`,
    name: '',
    description: '',
    priceDollars: 0,
    quantityTotal: 100,
    maxPerOrder: 6,
    ...overrides,
  }
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

// ─── Main Page ─────────────────────────────────────────────────────────

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
  const [schedule, setSchedule] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  })
  const [venueSearch, setVenueSearch] = useState('')
  const [location, setLocation] = useState<USLocationValue>(emptyUSLocation())
  const [tiers, setTiers] = useState<TierEntry[]>([
    freshTier({ name: 'General Admission', priceDollars: 45, quantityTotal: 250 }),
  ])
  const [launchNow, setLaunchNow] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth?tab=signup')
  }, [status, router])

  // Keep form dates in sync with schedule
  useEffect(() => {
    setForm((f) => ({
      ...f,
      startsAt:
        schedule.startDate && schedule.startTime
          ? `${schedule.startDate}T${schedule.startTime}`
          : '',
      endsAt:
        schedule.endDate && schedule.endTime
          ? `${schedule.endDate}T${schedule.endTime}`
          : '',
    }))
  }, [schedule.startDate, schedule.startTime, schedule.endDate, schedule.endTime])

  // ── Tier manipulation ──────────────────────────────────────────────

  const addTier = () => setTiers((prev) => [...prev, freshTier()])

  const duplicateTier = (id: string) => {
    setTiers((prev) => {
      const idx = prev.findIndex((t) => t.id === id)
      if (idx < 0) return prev
      const source = prev[idx]
      const copy = freshTier({ ...source, name: `${source.name} (copy)` })
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }

  const deleteTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTier = (id: string, patch: Partial<TierEntry>) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const moveTier = (id: string, dir: -1 | 1) => {
    setTiers((prev) => {
      const idx = prev.findIndex((t) => t.id === id)
      if (idx < 0) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  // ── Submit ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const description = form.description.trim()
    if (description.length < MIN_DESCRIPTION_LENGTH) {
      toast.error(
        `Description needs at least ${MIN_DESCRIPTION_LENGTH} characters (${description.length}/${MIN_DESCRIPTION_LENGTH})`
      )
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

      // Create all tiers
      const createdTiers = []
      for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i]
        const tier = await createTier.mutateAsync({
          eventId: event.id,
          name: t.name,
          description: t.description,
          priceCents: Math.round(Number(t.priceDollars) * 100),
          quantityTotal: Number(t.quantityTotal),
          maxPerOrder: Number(t.maxPerOrder),
        })
        createdTiers.push(tier)
      }

      if (launchNow) {
        for (const tier of createdTiers) {
          await openSales.mutateAsync({ id: tier.id })
        }
        await goLive.mutateAsync({ id: event.id })
      }

      await utils.event.myEvents.invalidate()
      toast.success(launchNow ? 'Drop launched' : 'Draft saved')
      router.push(`/dashboard/events/${event.id}`)
    } catch (err) {
      toast.error(formatCreateDropError(err))
    }
  }

  // ── Validation ─────────────────────────────────────────────────────

  const descriptionLength = form.description.trim().length
  const descriptionValid = descriptionLength >= MIN_DESCRIPTION_LENGTH
  const titleValid = form.title.trim().length >= MIN_TITLE_LENGTH

  const isSubmitting =
    createEvent.isPending ||
    createTier.isPending ||
    openSales.isPending ||
    goLive.isPending

  const detailsMissing = [
    !titleValid && 'title',
    !descriptionValid && 'description',
    form.venueName.trim().length < 2 && 'venue name',
    form.venueAddress.trim().length < 5 && 'street address',
    location.displayCity.length < 2 && 'city',
    !schedule.startDate && 'start date',
    !schedule.startTime && 'start time',
    !schedule.endDate && 'end date',
    !schedule.endTime && 'end time',
  ].filter(Boolean) as string[]

  const canNext =
    step === 0
      ? Boolean(form.posterUrl)
      : step === 1
        ? detailsMissing.length === 0
        : step === 2
          ? tiers.length > 0 && tiers.every((t) => t.name.trim().length > 0 && t.priceDollars > 0)
          : true

  const handleContinue = () => {
    if (canNext) {
      setStep(step + 1)
      return
    }

    if (step === 1 && detailsMissing.length > 0) {
      toast.error(
        `Missing ${detailsMissing.slice(0, 3).join(', ')}${detailsMissing.length > 3 ? '…' : ''}`
      )
      return
    }

    if (step === 2) {
      const emptyNames = tiers.filter((t) => !t.name.trim()).length
      const zeroPrices = tiers.filter((t) => t.priceDollars <= 0).length
      if (emptyNames > 0) toast.error(`${emptyNames} tier(s) missing a name`)
      else if (zeroPrices > 0) toast.error(`${zeroPrices} tier(s) need a price above $0`)
      else toast.error('Add a tier name and price before continuing')
      return
    }

    toast.error('Finish this step before continuing')
  }

  const totalTierCapacity = tiers.reduce((sum, t) => sum + Number(t.quantityTotal || 0), 0)
  const capacityExceeded = totalTierCapacity > Number(form.capacity)

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <AppShell footer={false}>
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden px-4 py-6 sm:px-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            {COPY.openNewDrop}
          </h1>
        </div>

        {/* ── Stepper ─────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-0 sm:mb-8">
          {STEPS.map((label, i) => {
            const isComplete = i < step
            const isCurrent = i === step
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200',
                      isCurrent &&
                        'bg-acid text-bg shadow-glow-acid scale-110',
                      isComplete &&
                        'bg-acid/15 text-acid border border-acid/30',
                      !isCurrent &&
                        !isComplete &&
                        'bg-panel-2 text-muted border border-border'
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      'hidden text-[9px] font-medium uppercase tracking-widest sm:block',
                      isCurrent ? 'text-text' : 'text-muted'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-px flex-1 min-w-[16px] transition-colors',
                      i < step ? 'bg-acid/50' : 'bg-border'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Grid ────────────────────────────────────────────────────── */}
        <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)] md:gap-8">
          {/* Preview panel — appears first on mobile via order */}
          <div className="min-w-0 md:order-2 md:sticky md:top-24">
            <Panel className="overflow-hidden">
              <div className="relative aspect-[16/10] md:aspect-[4/5]">
                <EventPoster
                  src={form.posterUrl}
                  title={form.title || 'Your drop title'}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                <div className="absolute bottom-0 p-4 sm:p-6">
                  <p className="font-display text-2xl tracking-tight leading-tight sm:text-3xl">
                    {form.title || 'Your drop title'}
                  </p>
                  {form.subtitle && (
                    <p className="mt-2 text-sm text-muted">{form.subtitle}</p>
                  )}
                  {location.displayCity && (
                    <p className="mt-3 font-mono text-xs text-muted">
                      {form.venueName || 'Venue'} · {location.displayCity}
                    </p>
                  )}
                  {tiers.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tiers.slice(0, 2).map((t) => (
                        <span
                          key={t.id}
                          className="inline-block rounded-full border border-acid/40 bg-acid/10 px-2.5 py-0.5 text-[11px] font-mono text-acid"
                        >
                          {t.name || 'Unnamed'} · ${t.priceDollars}
                        </span>
                      ))}
                      {tiers.length > 2 && (
                        <span className="inline-block rounded-full border border-border bg-panel-2 px-2.5 py-0.5 text-[11px] font-mono text-muted">
                          +{tiers.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* ── Step Content ───────────────────────────────────────────── */}
          <div className="min-w-0 md:order-1">
            {/* Step 0: Poster */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">
                  {COPY.pickPoster}
                </h2>
                <div>
                  <Label>Custom poster URL</Label>
                  <Input
                    value={form.posterUrl}
                    onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                    placeholder="https://images.yourdomain.com/poster.jpg"
                  />
                  <FieldHint>
                    Paste any image URL, or choose a Willcall preset below.
                  </FieldHint>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
                  {posterPresets.map((poster) => (
                    <button
                      key={poster}
                      type="button"
                      onClick={() => setForm({ ...form, posterUrl: poster })}
                      className={cn(
                        'relative aspect-[4/3] overflow-hidden rounded-pass border',
                        form.posterUrl === poster
                          ? 'border-acid shadow-glow-acid'
                          : 'border-border'
                      )}
                    >
                      <EventPoster
                        src={poster}
                        title="Poster preset"
                        className="absolute inset-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">
                  {COPY.dropDetails}
                </h2>

                <div>
                  <Label>Title *</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Neon District Block Party"
                  />
                </div>

                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <textarea
                    required
                    rows={4}
                    minLength={MIN_DESCRIPTION_LENGTH}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                      venueName:
                        f.venueName.trim().length === 0 || f.venueName === previousSearch
                          ? value
                          : f.venueName,
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
                <FieldHint>
                  Pick a venue suggestion to fill address, city, timezone, and coordinates.
                </FieldHint>

                <div>
                  <Label>Venue name *</Label>
                  <Input
                    required
                    value={form.venueName}
                    onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                    placeholder="The Echo"
                  />
                </div>

                <div>
                  <Label>Street address *</Label>
                  <Input
                    required
                    value={form.venueAddress}
                    onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                    placeholder="1822 Sunset Blvd"
                  />
                  <FieldHint>
                    Auto-filled from venue search when available. You can edit it before launch.
                  </FieldHint>
                </div>

                <USStateCitySelect
                  required
                  value={location}
                  onChange={(loc) => {
                    setLocation(loc)
                    setForm((f) => ({
                      ...f,
                      city: loc.displayCity,
                      timezone: loc.stateCode
                        ? timezoneForState(loc.stateCode)
                        : f.timezone,
                    }))
                  }}
                />

                <ScheduleSection
                  schedule={schedule}
                  onChange={(s) => setSchedule(s)}
                  timezone={form.timezone}
                />

                <div>
                  <Label>Capacity *</Label>
                  <Input
                    required
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: parseInt(e.target.value) || 0 })
                    }
                    mono
                  />
                </div>
              </div>
            )}

            {/* Step 2: Ticket Tiers */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">
                  {COPY.ticketTiers}
                </h2>

                {tiers.length === 0 && (
                  <p className="text-sm text-muted">
                    No tiers yet. Add your first ticket tier below.
                  </p>
                )}

                <div className="space-y-3">
                  {tiers.map((tier, idx) => (
                    <Panel key={tier.id} className="overflow-hidden">
                      <div className="space-y-3 p-4">
                        {/* Tier header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted">
                            Tier {idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveTier(tier.id, -1)}
                              disabled={idx === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-panel-2 hover:text-text disabled:pointer-events-none disabled:opacity-30 transition-colors"
                              title="Move up"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTier(tier.id, 1)}
                              disabled={idx === tiers.length - 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-panel-2 hover:text-text disabled:pointer-events-none disabled:opacity-30 transition-colors"
                              title="Move down"
                            >
                              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateTier(tier.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-panel-2 hover:text-text transition-colors"
                              title="Duplicate tier"
                            >
                              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTier(tier.id)}
                              disabled={tiers.length <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-danger/20 hover:text-danger transition-colors disabled:pointer-events-none disabled:opacity-30"
                              title="Delete tier"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Tier fields */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Label>Tier name *</Label>
                            <Input
                              required
                              value={tier.name}
                              onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                              placeholder="VIP, Early Bird, General Admission…"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Description</Label>
                            <Input
                              value={tier.description}
                              onChange={(e) =>
                                updateTier(tier.id, { description: e.target.value })
                              }
                              placeholder="What's included in this tier?"
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="min-w-0">
                            <Label>Price ($) *</Label>
                            <Input
                              required
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.priceDollars}
                              onChange={(e) =>
                                updateTier(tier.id, {
                                  priceDollars: parseFloat(e.target.value) || 0,
                                })
                              }
                              mono
                            />
                          </div>
                          <div className="min-w-0">
                            <Label>Qty *</Label>
                            <Input
                              required
                              type="number"
                              min="1"
                              value={tier.quantityTotal}
                              onChange={(e) =>
                                updateTier(tier.id, {
                                  quantityTotal: parseInt(e.target.value) || 0,
                                })
                              }
                              mono
                            />
                          </div>
                          <div className="min-w-0">
                            <Label>Max/order *</Label>
                            <Input
                              required
                              type="number"
                              min="1"
                              value={tier.maxPerOrder}
                              onChange={(e) =>
                                updateTier(tier.id, {
                                  maxPerOrder: parseInt(e.target.value) || 1,
                                })
                              }
                              mono
                            />
                          </div>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </div>

                {/* Add another tier */}
                <button
                  type="button"
                  onClick={addTier}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-drop border-2 border-dashed border-border py-3',
                    'text-sm text-muted hover:border-acid/40 hover:bg-acid/5 hover:text-text transition-colors focus-ring'
                  )}
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Add another tier
                </button>

                {/* Capacity summary */}
                {tiers.length > 0 && (
                  <div className="rounded-drop border border-white/10 bg-bg/50 px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Total tier capacity</span>
                      <span
                        className={cn(
                          'font-mono',
                          capacityExceeded ? 'text-danger' : 'text-text'
                        )}
                      >
                        {totalTierCapacity.toLocaleString()} /{' '}
                        {Number(form.capacity).toLocaleString()}
                      </span>
                    </div>
                    {capacityExceeded && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-danger">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        Total tier capacity exceeds event capacity
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Launch */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">
                  {COPY.readyToLaunch}
                </h2>

                <Panel className="divide-y divide-border overflow-hidden">
                  {/* Event info */}
                  <div className="space-y-2 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Event</span>
                      <span className="text-right font-medium">{form.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Venue</span>
                      <span className="text-right">
                        {form.venueName} · {location.displayCity || form.city}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Capacity</span>
                      <span className="font-mono">{form.capacity}</span>
                    </div>
                    {schedule.startDate && (
                      <div className="flex justify-between">
                        <span className="text-muted">Starts</span>
                        <span className="font-mono text-xs">
                          {schedule.startDate && schedule.startTime
                            ? format(
                                parse(
                                  `${schedule.startDate}T${schedule.startTime}`,
                                  "yyyy-MM-dd'T'HH:mm",
                                  new Date()
                                ),
                                'MMM d, yyyy · h:mm a'
                              )
                            : schedule.startDate}
                        </span>
                      </div>
                    )}
                    {schedule.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted">Ends</span>
                        <span className="font-mono text-xs">
                          {schedule.endDate && schedule.endTime
                            ? format(
                                parse(
                                  `${schedule.endDate}T${schedule.endTime}`,
                                  "yyyy-MM-dd'T'HH:mm",
                                  new Date()
                                ),
                                'MMM d, yyyy · h:mm a'
                              )
                            : schedule.endDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* All tiers */}
                  <div className="space-y-2 p-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted">
                      Ticket Tiers ({tiers.length})
                    </p>
                    {tiers.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-lg bg-panel-2/50 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {t.name || 'Unnamed tier'}
                          </p>
                          {t.description && (
                            <p className="truncate text-xs text-muted">
                              {t.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-3 flex shrink-0 items-center gap-3 font-mono text-xs text-muted">
                          <span>${t.priceDollars}</span>
                          <span>{t.quantityTotal} qty</span>
                          <span>max {t.maxPerOrder}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Launch toggle */}
                  <div className="p-4">
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span>
                        <span className="block text-sm font-semibold">
                          Launch on sale now
                        </span>
                        <span className="block text-xs text-muted">
                          Open sales and show in discovery immediately.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={launchNow}
                        onChange={(e) => setLaunchNow(e.target.checked)}
                        className="h-5 w-5 accent-acid rounded"
                      />
                    </label>
                  </div>
                </Panel>
              </div>
            )}

            {/* ── Navigation ──────────────────────────────────────────── */}
            <div className="mt-6 flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button className="flex-1 sm:flex-none" onClick={handleContinue}>
                  Continue
                </Button>
              ) : (
                <Button
                  className="flex-1 sm:flex-none"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting
                    ? 'Launching…'
                    : launchNow
                      ? COPY.launchDrop
                      : 'Save draft'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
