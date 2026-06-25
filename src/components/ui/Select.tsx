'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { ChevronDown } from 'lucide-react'

type Option = {
  value: string
  label: string
}

type SelectProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
  label?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  disabled,
  error,
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !ref.current?.contains(e.target as Node)) return
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full h-14 rounded-[16px] px-4 inline-flex items-center justify-between gap-3 transition-all',
          'text-[15px] font-semibold font-sans text-text',
          disabled && 'opacity-42 cursor-not-allowed',
          error
            ? 'border border-rose/60 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
            : 'border border-white/11 hover:border-white/18',
          open && 'border-acid/48 shadow-[0_0_0_3px_rgba(255,90,31,0.12)]',
          'bg-white/[0.045]'
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted transition-transform duration-140', open && 'rotate-180 opacity-100')}
          strokeWidth={2}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className={cn(
              'absolute z-80 w-full overflow-hidden rounded-[16px] p-[6px] mt-2',
              'bg-gradient-to-b from-white/[0.055] to-white/[0.025] bg-[#0b0b0b]',
              'border border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]',
              'animate-in fade-in slide-in-from-top-1 duration-120'
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'w-full h-[42px] rounded-[11px] px-3 flex items-center justify-between gap-2',
                  'text-[14px] font-semibold font-sans transition-colors cursor-pointer outline-none',
                  option.value === value
                    ? 'bg-acid/13 text-text'
                    : 'text-muted hover:bg-white/[0.075] hover:text-text'
                )}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <span className="text-acid text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-rose/80 font-sans">{error}</p>
      )}
    </div>
  )
}
