'use client'

import { useEffect, useRef } from 'react'

type ScanCameraProps = {
  onScan: (value: string) => void
  active: boolean
}

export function ScanCamera({ onScan, active }: ScanCameraProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    let cancelled = false

    ;(async () => {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (cancelled || !ref.current) return

      const id = 'turnstile-qr-reader'
      ref.current.id = id
      const scanner = new Html5Qrcode(id)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decoded) => onScan(decoded),
          () => undefined
        )
      } catch {
        // Camera unavailable — manual fallback remains
      }
    })()

    return () => {
      cancelled = true
      scannerRef.current?.stop().catch(() => undefined)
      scannerRef.current = null
    }
  }, [active, onScan])

  if (!active) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black">
      <div ref={ref} className="min-h-[280px] w-full" />
      <p className="p-2 text-center text-xs text-muted">Point camera at ticket QR</p>
    </div>
  )
}
