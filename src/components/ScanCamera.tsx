'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react'
import type { Html5Qrcode as Html5QrcodeType } from 'html5-qrcode'

export type CameraState = 'loading' | 'ready' | 'denied' | 'unavailable'

export type ScanCameraHandle = {
  switchCamera: () => Promise<void>
  toggleTorch: () => Promise<boolean>
  retry: () => Promise<void>
}

type ScanCameraProps = {
  onScan: (value: string) => void
  active: boolean
  paused?: boolean
  onStateChange?: (state: CameraState) => void
  onTorchSupported?: (supported: boolean) => void
}

export const ScanCamera = forwardRef<ScanCameraHandle, ScanCameraProps>(function ScanCamera(
  { onScan, active, paused, onStateChange, onTorchSupported },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5QrcodeType | null>(null)
  const [state, setState] = useState<CameraState>('loading')
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const currentCameraIdx = useRef(0)

  const updateState = useCallback(
    (s: CameraState) => {
      setState(s)
      onStateChange?.(s)
    },
    [onStateChange]
  )

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return
    const { Html5Qrcode } = await import('html5-qrcode')

    const id = 'willcall-qr-reader'
    containerRef.current.id = id

    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ignore */ }
      scannerRef.current = null
    }

    const scanner = new Html5Qrcode(id)
    scannerRef.current = scanner

    try {
      const allCams = await Html5Qrcode.getCameras()
      setCameras(allCams)
    } catch { /* no cameras info */ }

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => onScan(decoded),
        () => { /* qr error — ignore */ }
      )

      updateState('ready')

      // Check torch support silently
      try {
        const caps = scanner.getRunningTrackCameraCapabilities()
        if (caps) {
          const torch = caps.torchFeature()
          if (torch?.isSupported()) {
            onTorchSupported?.(true)
          }
        }
      } catch { /* torch check failed */ }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const errName = err instanceof Error ? err.name : ''
      if (errName === 'NotAllowedError' || msg.toLowerCase().includes('permission')) {
        updateState('denied')
      } else {
        updateState('unavailable')
      }
    }
  }, [onScan, onTorchSupported, updateState])

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => updateState('loading'), 0)
    let cancelled = false

    ;(async () => {
      await startScanner()
      if (cancelled && scannerRef.current) {
        try { await scannerRef.current.stop() } catch { /* ignore */ }
        scannerRef.current = null
      }
    })()

    return () => {
      clearTimeout(timer)
      cancelled = true
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { /* ignore */ })
        scannerRef.current = null
      }
    }
  }, [active, startScanner, updateState])

  // Pause/resume scanning
  useEffect(() => {
    if (!scannerRef.current) return
    try {
      if (paused) scannerRef.current.pause()
      else scannerRef.current.resume()
    } catch { /* pause/resume failed */ }
  }, [paused])

  useImperativeHandle(
    ref,
    () => ({
      switchCamera: async () => {
        if (cameras.length < 2 || !scannerRef.current) return
        const nextIdx = (currentCameraIdx.current + 1) % cameras.length
        currentCameraIdx.current = nextIdx
        const cam = cameras[nextIdx]
        try {
          await scannerRef.current.applyVideoConstraints({ deviceId: { exact: cam.id } })
        } catch { /* switch failed */ }
      },
      toggleTorch: async () => {
        if (!scannerRef.current) return false
        try {
          const caps = scannerRef.current.getRunningTrackCameraCapabilities()
          if (!caps) return false
          const torch = caps.torchFeature()
          if (!torch?.isSupported()) return false
          const next = !torch.value()
          await torch.apply(next)
          return next
        } catch { return false }
      },
      retry: async () => {
        updateState('loading')
        if (scannerRef.current) {
          try { await scannerRef.current.stop() } catch { /* ignore */ }
          scannerRef.current = null
        }
        await startScanner()
      },
    }),
    [cameras, startScanner, updateState]
  )

  if (!active) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      {/* Camera viewport */}
      <div ref={containerRef} className="min-h-[320px] w-full md:min-h-[420px]" />

      {/* Scan frame — corner brackets only */}
      {state === 'ready' && !paused && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-52 w-52">
            <span className="absolute -top-[3px] -left-[3px] h-7 w-7 rounded-tl-md border-l-[3px] border-t-[3px] border-white/80" />
            <span className="absolute -top-[3px] -right-[3px] h-7 w-7 rounded-tr-md border-r-[3px] border-t-[3px] border-white/80" />
            <span className="absolute -bottom-[3px] -left-[3px] h-7 w-7 rounded-bl-md border-b-[3px] border-l-[3px] border-white/80" />
            <span className="absolute -bottom-[3px] -right-[3px] h-7 w-7 rounded-br-md border-b-[3px] border-r-[3px] border-white/80" />
          </div>
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-3 text-xs text-white/60 font-sans">Starting camera…</p>
        </div>
      )}

      {/* Denied */}
      {state === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-6 text-center">
          <CameraOffIcon className="mb-3 h-8 w-8 text-[#ef4444]" />
          <p className="text-sm font-medium text-white/80 font-sans">Camera access denied</p>
          <p className="mt-1 max-w-xs text-xs text-white/50 font-sans">
            Allow camera access in your browser settings, then tap retry below.
          </p>
        </div>
      )}

      {/* Unavailable */}
      {state === 'unavailable' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-6 text-center">
          <CameraOffIcon className="mb-3 h-8 w-8 text-white/40" />
          <p className="text-sm font-medium text-white/80 font-sans">Camera unavailable</p>
          <p className="mt-1 max-w-xs text-xs text-white/50 font-sans">
            No camera found or another app is using it. Use manual lookup below.
          </p>
        </div>
      )}

      {/* Paused overlay */}
      {paused && state === 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65">
          <p className="text-sm font-medium text-white/80 font-sans">Scanning paused</p>
        </div>
      )}

      {/* Camera ready indicator */}
      {state === 'ready' && !paused && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/70 font-sans">Camera ready</span>
          </div>
        </div>
      )}
    </div>
  )
})

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16" />
      <path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5" />
    </svg>
  )
}
