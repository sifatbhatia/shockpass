import { redirect } from 'next/navigation'

export default function CheckInRedirect({ params }: { params: { id: string } }) {
  redirect(`/scan?event=${params.id}`)
}