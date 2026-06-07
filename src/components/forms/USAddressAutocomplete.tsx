'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Label, Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { GeocodeResult } from '@/app/api/geocode/route'
import type { USLocationValue } from './USStateCitySelect'
import { timezoneForState, US_STATES } from '@/lib/us-locations'

export type AddressFormPatch = {
  venueAddress: string
  venueName?: string
  city: string
  location: USLocationValue
  lat?: number
  lng?: number
  timezone?: string
}

type USAddressAutocompleteProps = {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSelect: (patch: AddressFormPatch) => void
  disabled?: boolean
  className?: string
}

export function USAddressAutocomplete({
  label = 'Venue address',
  placeholder = 'Search venue or street address…',
  value,
  onChange,
  onSelect,
  disabled,
  className,
}: USAddressAutocompleteProps) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null)

  const updateDropdownPosition = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gutter = 16
    const availableWidth = Math.max(0, window.innerWidth - gutter * 2)
    const width = Math.min(rect.width, availableWidth)
    setDropdownStyle({
      top: rect.bottom + window.scrollY + 4,
      left: Math.max(gutter, Math.min(rect.left, window.innerWidth - width - gutter)) + window.scrollX,
      width,
    })
  }, [])

  useEffect(() => {
    if (!value || value.length < 3) {
      queueMicrotask(() => {
        setResults([])
        setError(null)
      })
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Address lookup unavailable')
          setResults([])
          return
        }
        setResults(data.results ?? [])
        setOpen(true)
        updateDropdownPosition()
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Address lookup failed')
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value, updateDropdownPosition])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
    }
  }, [updateDropdownPosition])

  const pickResult = (result: GeocodeResult) => {
    const state = US_STATES.find((s) => s.code === result.stateCode)
    onChange(result.venueAddress)
    onSelect({
      venueAddress: result.venueAddress,
      venueName: result.venueName ?? undefined,
      city: result.city,
      location: {
        stateCode: result.stateCode,
        stateName: state?.name ?? '',
        cityName: result.city.split(',')[0]?.trim() ?? '',
        displayCity: result.city,
      },
      lat: result.lat,
      lng: result.lng,
      timezone: result.stateCode ? timezoneForState(result.stateCode) : undefined,
    })
    setOpen(false)
    setResults([])
    setActiveIndex(-1)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pickResult(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const dropdown =
    open && dropdownStyle && typeof document !== 'undefined'
      ? createPortal(
          <ul
            id={listId}
            role="listbox"
            className="fixed z-[100] max-h-72 overflow-y-auto rounded-pass border border-white/12 bg-bg/95 p-1 shadow-panel backdrop-blur-xl"
            style={{
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
          >
            {loading && (
              <li className="px-4 py-3 text-xs text-muted animate-pulse">Searching venues…</li>
            )}
            {!loading && results.length === 0 && !error && value.length >= 3 && (
              <li className="px-4 py-3 text-xs text-muted">No venues found. Enter address manually below.</li>
            )}
            {error && (
              <li className="px-4 py-3 text-xs text-danger">{error}</li>
            )}
            {results.map((result, i) => (
              <li key={`${result.lat}-${result.lng}-${i}`} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-drop px-3 py-3 text-left text-sm transition-colors hover:bg-white/[0.055]',
                    i === activeIndex && 'bg-white/[0.07]'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pickResult(result)
                  }}
                >
                  <span className="block truncate font-medium text-text">{result.venueName || result.venueAddress}</span>
                  <span className="mt-1 block truncate text-xs text-muted">{result.label}</span>
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Label>{label}</Label>
      <Input
        ref={inputRef}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onFocus={() => {
          updateDropdownPosition()
          if (results.length > 0) setOpen(true)
        }}
        onChange={(e) => {
          onChange(e.target.value)
          setActiveIndex(-1)
        }}
        onKeyDown={onKeyDown}
      />
      {loading && (
        <span className="absolute right-3 top-[38px] text-[10px] text-muted">…</span>
      )}
      {dropdown}
      <p className="mt-1.5 text-[10px] text-muted">US addresses only. Pick a suggestion or fill fields manually.</p>
    </div>
  )
}
