'use client'

import { useMemo } from 'react'
import { Label } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import {
  US_STATES,
  getCitiesForState,
  formatDisplayCity,
  parseDisplayCity,
} from '@/lib/us-locations'

export type USLocationValue = {
  stateCode: string
  stateName: string
  cityName: string
  displayCity: string
}

type USStateCitySelectProps = {
  value: USLocationValue
  onChange: (value: USLocationValue) => void
  cityLabel?: string
  stateLabel?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

export function USStateCitySelect({
  value,
  onChange,
  cityLabel = 'City',
  stateLabel = 'State',
  required,
  className,
  disabled,
}: USStateCitySelectProps) {
  const cities = useMemo(() => getCitiesForState(value.stateCode), [value.stateCode])

  const handleStateChange = (stateCode: string) => {
    const state = US_STATES.find((s) => s.code === stateCode)
    onChange({
      stateCode,
      stateName: state?.name ?? '',
      cityName: '',
      displayCity: '',
    })
  }

  const handleCityChange = (cityName: string) => {
    onChange({
      ...value,
      cityName,
      displayCity: cityName && value.stateCode ? formatDisplayCity(cityName, value.stateCode) : '',
    })
  }

  const handleDisplayCityChange = (displayCity: string) => {
    const parsed = parseDisplayCity(displayCity)
    if (parsed) {
      const state = US_STATES.find((s) => s.code === parsed.stateCode)
      onChange({
        stateCode: parsed.stateCode,
        stateName: state?.name ?? '',
        cityName: parsed.cityName,
        displayCity,
      })
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label>{stateLabel}{required ? ' *' : ''}</Label>
        <select
          required={required}
          disabled={disabled}
          value={value.stateCode}
          onChange={(e) => handleStateChange(e.target.value)}
          className="w-full rounded-drop border border-border bg-panel-2 px-4 py-3 text-sm text-text focus:border-acid/50 focus:outline-none disabled:opacity-50"
        >
          <option value="">Select state</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>{cityLabel}{required ? ' *' : ''}</Label>
        {value.stateCode && cities.length > 0 ? (
          <select
            required={required}
            disabled={disabled || !value.stateCode}
            value={value.cityName}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full rounded-drop border border-border bg-panel-2 px-4 py-3 text-sm text-text focus:border-acid/50 focus:outline-none disabled:opacity-50"
          >
            <option value="">Select city</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        ) : (
          <input
            required={required}
            disabled={disabled || !value.stateCode}
            value={value.cityName}
            onChange={(e) => handleCityChange(e.target.value)}
            onBlur={(e) => {
              if (value.stateCode && e.target.value) {
                handleDisplayCityChange(formatDisplayCity(e.target.value, value.stateCode))
              }
            }}
            placeholder={value.stateCode ? 'Enter city name' : 'Select state first'}
            className="w-full rounded-drop border border-border bg-panel-2 px-4 py-3 text-sm text-text placeholder:text-muted focus:border-acid/50 focus:outline-none disabled:opacity-50"
          />
        )}
      </div>
    </div>
  )
}

export function emptyUSLocation(): USLocationValue {
  return { stateCode: '', stateName: '', cityName: '', displayCity: '' }
}

export function usLocationFromDisplay(displayCity: string): USLocationValue {
  const parsed = parseDisplayCity(displayCity)
  if (!parsed) return { ...emptyUSLocation(), displayCity }
  const state = US_STATES.find((s) => s.code === parsed.stateCode)
  return {
    stateCode: parsed.stateCode,
    stateName: state?.name ?? '',
    cityName: parsed.cityName,
    displayCity,
  }
}
