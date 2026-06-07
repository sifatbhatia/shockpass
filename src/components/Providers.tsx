'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#0d0d0f', color: '#f5f5f5', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#f5f5f5' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f5f5f5' } },
        }}
      />
    </SessionProvider>
  )
}
