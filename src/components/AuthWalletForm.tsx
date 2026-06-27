'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Panel } from '@/components/ui/Panel'
import { BRAND } from '@/lib/brand'
import { COPY } from '@/lib/copy'
import { walletConnectProjectId } from '@/lib/wallet-env'

const WalletAuthOption = dynamic(
  () => import('@/components/WalletAuthOption').then((mod) => mod.WalletAuthOption),
  { ssr: false }
)

function safeCallbackUrl(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

function AuthFields() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'))
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const walletAuthEnabled = Boolean(walletConnectProjectId)

  useEffect(() => {
    if (session) router.push(callbackUrl)
  }, [callbackUrl, session, router])

  const handleEmailAuth = async () => {
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      const result = await signIn('email', {
        email,
        name: tab === 'signup' ? name : undefined,
        redirect: false,
      })
      if (result?.error) {
        toast.error('Could not sign in')
        return
      }
      toast.success(tab === 'signup' ? 'Account created' : 'Signed in')
      await update()
      router.refresh()
      router.push(callbackUrl)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: venue imagery */}
      <div className="relative hidden min-h-screen overflow-hidden border-r border-white/10 bg-bg md:block grain-overlay">
        <Image
          src="/assets/willcall-hero-drop-v2.webp"
          alt=""
          fill
          priority
          className="object-cover opacity-86 saturate-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.22)_0%,rgba(5,5,5,0.42)_38%,#050505_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(248,214,247,0.18),transparent_34%),radial-gradient(ellipse_at_84%_70%,rgba(143,217,189,0.11),transparent_32%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <BrandMark showPulse />
          <div>
            <p className="mb-5 inline-flex rounded-full border border-nav-accent/25 bg-nav-accent/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-nav-accent">
              Tickets · wallet · door
            </p>
            <p className="max-w-xl font-display text-6xl leading-[0.9] tracking-tight">
              Own the room before doors open.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Fast buyer checkout, polished pass delivery, and scanner-ready entry for organizers who care about the whole night.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 border-y border-white/10 bg-bg/40 backdrop-blur-md">
              {[
                ['0', 'signup wall'],
                ['10s', 'target checkout'],
                ['QR', 'door ready'],
              ].map(([value, label]) => (
                <div key={label} className="border-r border-white/10 px-4 py-4 last:border-r-0">
                  <p className="font-mono text-xl text-text">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <BrandMark className="md:hidden mb-8" />
          <Panel className="p-6">
            <div className="mb-6 flex rounded-drop bg-panel-2 p-1">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`focus-ring flex-1 rounded-drop py-2.5 text-sm font-medium font-sans transition-colors ${tab === 'login' ? 'bg-panel text-text' : 'text-muted hover:text-text'}`}
              >
                {COPY.signIn}
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`focus-ring flex-1 rounded-drop py-2.5 text-sm font-medium font-sans transition-colors ${tab === 'signup' ? 'bg-panel text-text' : 'text-muted hover:text-text'}`}
              >
                {COPY.joinTheRoom}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              {tab === 'signup' && (
                <>
                  <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <p className="rounded-drop border border-white/10 bg-panel-2 px-3 py-2 text-xs leading-relaxed text-muted">
                    New accounts start as buyers. Organizer access is granted after approval.
                  </p>
                </>
              )}
              <Button className="w-full" onClick={handleEmailAuth} disabled={loading}>
                {loading ? 'Sending...' : tab === 'login' ? COPY.signInEmail : 'Create account'}
              </Button>
              {walletAuthEnabled && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center"><span className="bg-panel px-3 text-xs text-muted">or continue with</span></div>
                  </div>
                  <WalletAuthOption callbackUrl={callbackUrl} />
                </>
              )}
            </div>
          </Panel>
          <p className="text-xs text-muted text-center mt-6">By continuing, you agree to {BRAND.name}&apos;s Terms of Service.</p>
        </div>
      </div>
    </div>
  )
}

export function AuthWalletForm() {
  return <AuthFields />
}
