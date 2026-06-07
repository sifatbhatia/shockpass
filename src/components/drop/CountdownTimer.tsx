'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

type CountdownTimerProps = {
  target: Date | string
  className?: string
  onExpire?: () => void
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function CountdownTimer({ target, className, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const end = new Date(target).getTime()
    const tick = () => {
      const diff = end - Date.now()
      if (diff <= 0) {
        setRemaining(null)
        onExpire?.()
        return
      }
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target, onExpire])

  if (!remaining) return null

  const units = [
    remaining.d > 0 && { v: remaining.d, l: 'd' },
    { v: remaining.h, l: 'h' },
    { v: remaining.m, l: 'm' },
    { v: remaining.s, l: 's' },
  ].filter(Boolean) as { v: number; l: string }[]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {units.map(({ v, l }) => (
        <div key={l} className="text-center">
          <span className="font-display text-4xl md:text-5xl text-acid tabular-nums">{pad(v)}</span>
          <span className="block text-[10px] uppercase tracking-widest text-muted">{l}</span>
        </div>
      ))}
    </div>
  )
}
