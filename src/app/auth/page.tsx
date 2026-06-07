'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const AuthForm = dynamic(
  () => import('@/components/AuthWalletForm').then(mod => mod.AuthWalletForm),
  { ssr: false }
)

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-acid border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthForm />
    </Suspense>
  )
}
