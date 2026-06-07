'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Panel } from '@/components/ui/Panel'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import toast from 'react-hot-toast'
import {
  USStateCitySelect,
  emptyUSLocation,
  usLocationFromDisplay,
  type USLocationValue,
} from '@/components/forms/USStateCitySelect'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const isOrganizer = session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'

  const { data: profile, isLoading } = trpc.organizer.getProfile.useQuery(undefined, {
    enabled: isOrganizer,
  })
  const updateProfile = trpc.organizer.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Brand profile saved')
      router.push('/dashboard')
    },
    onError: (e) => toast.error(e.message),
  })

  const [form, setForm] = useState({
    name: '',
    organizerSlug: '',
  })
  const [location, setLocation] = useState<USLocationValue>(emptyUSLocation())

  useEffect(() => {
    if (!profile) return

    queueMicrotask(() => {
      setForm({
        name: profile.name || '',
        organizerSlug: profile.organizerSlug || '',
      })
      if (profile.organizerCity) {
        setLocation(usLocationFromDisplay(profile.organizerCity))
      }
    })
  }, [profile])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-acid border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="font-display text-3xl tracking-tight mb-1">{COPY.setupBrand}</h1>
        <p className="text-sm text-muted mb-8">{COPY.setupBrandHint}</p>

        <Panel className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Organizer name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Neon District"
              />
            </div>
            <div>
              <Label>Public slug</Label>
              <Input
                mono
                value={form.organizerSlug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    organizerSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  })
                }
                placeholder="neon-district"
              />
            </div>
            <USStateCitySelect
              required
              cityLabel="Home city"
              value={location}
              onChange={setLocation}
            />
            <Button
              className="w-full"
              disabled={updateProfile.isPending || !form.name || !location.displayCity}
              onClick={() =>
                updateProfile.mutate({
                  ...form,
                  organizerCity: location.displayCity,
                })
              }
            >
              {COPY.saveBrandProfile}
            </Button>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
