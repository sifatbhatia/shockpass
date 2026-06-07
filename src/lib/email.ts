import { BRAND } from '@/lib/brand'

interface TicketEmailData {
  to: string
  eventTitle: string
  walletAccessToken?: string
  tickets: Array<{
    id: string
    qrToken: string
    tierName: string
    attendeeName?: string
  }>
}

export async function sendTicketEmail(data: TicketEmailData): Promise<void> {
  const { to, eventTitle, tickets, walletAccessToken } = data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const walletUrl = walletAccessToken
    ? `${appUrl}/wallet?access=${walletAccessToken}`
    : `${appUrl}/wallet`

  const ticketList = tickets
    .map(
      (t) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #333;">
        <strong>${t.tierName}</strong> ${t.attendeeName ? `— ${t.attendeeName}` : ''}
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #333; font-family: monospace;">
        ${t.id.slice(0, 12)}
      </td>
    </tr>
  `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="background: #0d0d0f; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="margin: 0 0 8px; color: #fff; font-size: 28px; font-weight: 700;">Your tickets are ready</h1>
            <p style="margin: 0 0 32px; color: #a1a1aa; font-size: 16px;">${eventTitle}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
              <thead>
                <tr style="background: #17171a;">
                  <th style="padding: 16px; text-align: left; color: #fff; font-weight: 600;">Ticket</th>
                  <th style="padding: 16px; text-align: left; color: #fff; font-weight: 600;">ID</th>
                </tr>
              </thead>
              <tbody>
                ${ticketList}
              </tbody>
            </table>

            <p style="margin: 32px 0 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
              <a href="${walletUrl}" style="display:inline-block;background:#d7ff3f;color:#050505;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">Open wallet</a>
            </p>
            <p style="margin: 16px 0 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
              QR codes rotate every 30 seconds for security — open your wallet at the door.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 24px; text-align: center;">
            <p style="margin: 0; color: #52525b; font-size: 12px;">${BRAND.name} — ${BRAND.tagline}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && !resendKey.includes('your_')) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || `${BRAND.name} <tickets@${BRAND.domain}>`,
        to: [to],
        subject: `Your tickets for ${eventTitle}`,
        html,
      }),
    })
    if (!res.ok) {
      console.error('[EMAIL] Resend failed', await res.text())
    }
    return
  }

  console.log('[EMAIL] Would send to:', to)
  console.log('[EMAIL] Subject: Your tickets for', eventTitle)
  console.log('[EMAIL] Wallet URL:', walletUrl)
  console.log('[EMAIL] Tickets:', tickets.length)
}
