'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BrandMark } from '@/components/BrandMark'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import toast from 'react-hot-toast'

export default function AttendeesPage() {
  const { id } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')
  const { data: session } = useSession()
  const isOrganizer = session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'

  const { data, isLoading } = trpc.organizer.attendees.useQuery(
    { eventId: id, limit: 100, search: search || undefined },
    { enabled: isOrganizer }
  )

  const { data: exportRows } = trpc.organizer.exportAttendees.useQuery(
    { eventId: id },
    { enabled: isOrganizer }
  )

  const tickets = data?.tickets ?? []

  const downloadCsv = () => {
    const rows = exportRows
    if (!rows?.length) return toast.error('No attendees to export')
    const header = 'ticketId,attendeeName,attendeeEmail,tierName,status,checkedInAt,buyerEmail,purchasedAt'
    const body = rows.map((r) =>
      [r.ticketId, r.attendeeName, r.attendeeEmail, r.tierName, r.status, r.checkedInAt, r.buyerEmail, r.purchasedAt].join(',')
    ).join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-[1650px] mx-auto border-b border-border">
        <BrandMark href={`/dashboard/events/${id}`} className="text-lg font-bold tracking-tight" />
        <button type="button" onClick={downloadCsv} className="text-sm text-acid hover:underline">{COPY.exportAttendees}</button>
      </nav>

      <div className="max-w-[1650px] mx-auto px-6 py-10">
        <h1 className="font-display text-3xl tracking-tight mb-6">Attendee list</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="w-full max-w-md rounded-drop border border-border bg-panel-2 px-4 py-3 text-sm mb-6 focus:border-acid/50 focus:outline-none"
        />

        {isLoading ? (
          <div className="w-6 h-6 border-2 border-acid border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="overflow-x-auto border border-border rounded-pass">
            <table className="w-full text-sm">
              <thead className="bg-panel-2 text-left text-xs text-muted uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Checked in</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="p-3">{t.attendeeName || '—'}</td>
                    <td className="p-3 font-mono text-xs">{t.attendeeEmail || t.order.buyerEmail}</td>
                    <td className="p-3">{t.ticketTier.name}</td>
                    <td className="p-3">{t.status}</td>
                    <td className="p-3">{t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
