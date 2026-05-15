import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { TicketStatus, Urgency } from '@prisma/client'
import { STATUS_LABELS, URGENCY_LABELS } from './utils'

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_SERVER_HOST,
  port:   Number(process.env.EMAIL_SERVER_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

const FROM = process.env.EMAIL_FROM ?? 'Dairy Block Hub <noreply@dairyblock.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Branded HTML helpers ─────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dairy Block Hub</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1A1A1A;border-radius:12px 12px 0 0;padding:28px 40px;text-align:left;">
            <span style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#C4DBCB;font-weight:600;">Dairy Block</span>
            <h1 style="margin:4px 0 0;font-size:20px;color:#FFFFFF;font-weight:700;letter-spacing:-0.02em;">Maintenance & Security Hub</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#FFFFFF;padding:40px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;border-radius:0 0 12px 12px;padding:20px 40px;border:1px solid #E5E7EB;border-top:none;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
              Dairy Block · 1800 Wazee St, Denver, CO 80202<br>
              Questions? Reply to this email or contact <a href="mailto:hub@dairyblock.com" style="color:#29967F;">hub@dairyblock.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ticketCard(ticket: {
  ticketNumber: string
  title: string
  type: string
  category: string
  status: TicketStatus
  urgency: Urgency
  url: string
}): string {
  const urgencyColor = ticket.urgency === 'EMERGENCY' ? '#F64741' : ticket.urgency === 'HIGH' ? '#E67C36' : '#F2A53F'
  return `
<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:24px 0;">
  <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
    <span style="font-size:12px;color:#6B7280;font-weight:600;letter-spacing:0.05em;">${ticket.ticketNumber}</span>
    <span style="font-size:11px;background:${urgencyColor}20;color:${urgencyColor};padding:2px 8px;border-radius:4px;font-weight:600;">${URGENCY_LABELS[ticket.urgency]}</span>
  </div>
  <h3 style="margin:0 0 6px;font-size:16px;color:#1A1A1A;">${ticket.title}</h3>
  <p style="margin:0 0 16px;font-size:13px;color:#6B7280;">${ticket.type} · ${ticket.category}</p>
  <a href="${ticket.url}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">View Ticket →</a>
</div>`
}

// ─── Email senders ────────────────────────────────────────────────────────────

interface TicketEmailData {
  ticketNumber: string
  title: string
  type: string
  category: string
  status: TicketStatus
  urgency: Urgency
  recipientName: string
  recipientEmail: string
}

export async function sendConfirmationEmail(data: TicketEmailData) {
  const url = `${APP_URL}/requests/${data.ticketNumber}`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">Your request has been received.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, we've got your ${data.type.toLowerCase()} request and our team is on it.
      You'll hear from us within <strong>${data.urgency === 'EMERGENCY' ? '1 hour' : data.urgency === 'HIGH' ? '4 hours' : data.urgency === 'MEDIUM' ? '24 hours' : '3–5 business days'}</strong>.
    </p>
    ${ticketCard({ ...data, url })}
    <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;line-height:1.7;">
      Need to add details or follow up? Log in to your tenant portal any time.
    </p>
  `)

  await transporter.sendMail({
    from: FROM,
    to: data.recipientEmail,
    subject: `[${data.ticketNumber}] Request Received — ${data.title}`,
    html,
  })
}

export async function sendStatusUpdateEmail(
  data: TicketEmailData,
  oldStatus: TicketStatus,
  note?: string
) {
  const url = `${APP_URL}/requests/${data.ticketNumber}`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">Status update on your request.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, your ticket has moved from <strong>${STATUS_LABELS[oldStatus]}</strong> to
      <strong style="color:#29967F;">${STATUS_LABELS[data.status]}</strong>.
    </p>
    ${note ? `<div style="background:#E8F2EC;border-left:3px solid #29967F;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#1A1A1A;font-style:italic;">"${note}"</p></div>` : ''}
    ${ticketCard({ ...data, url })}
  `)

  await transporter.sendMail({
    from: FROM,
    to: data.recipientEmail,
    subject: `[${data.ticketNumber}] Status Update: ${STATUS_LABELS[data.status]}`,
    html,
  })
}

export async function sendDenialEmail(
  data: TicketEmailData,
  reason: string
) {
  const url = `${APP_URL}/requests/new`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">An update on your request.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, after reviewing your ticket, our team was unable to fulfill this request at this time.
    </p>
    <div style="background:#FEF2F2;border-left:3px solid #F64741;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#F64741;text-transform:uppercase;letter-spacing:0.05em;">Reason</p>
      <p style="margin:0;font-size:14px;color:#1A1A1A;">${reason}</p>
    </div>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      If you believe this was in error or have additional context to share, please submit a new request or reply to this email.
    </p>
    <a href="${url}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Submit a New Request →</a>
  `)

  await transporter.sendMail({
    from: FROM,
    to: data.recipientEmail,
    subject: `[${data.ticketNumber}] Request Update`,
    html,
  })
}

export async function sendCompletionEmail(data: TicketEmailData) {
  const ratingUrl = `${APP_URL}/requests/${data.ticketNumber}?rate=true`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">Your request has been completed.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, great news — your ${data.type.toLowerCase()} request has been resolved.
      We hope everything is back in order.
    </p>
    ${ticketCard({ ...data, url: `${APP_URL}/requests/${data.ticketNumber}` })}
    <div style="margin-top:24px;padding:20px;background:#E8F2EC;border-radius:8px;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:#1A1A1A;font-weight:600;">How did we do?</p>
      <p style="margin:0 0 16px;font-size:13px;color:#4B5563;">Your feedback helps us serve the Dairy Block community better.</p>
      <a href="${ratingUrl}" style="display:inline-block;background:#29967F;color:#FFFFFF;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:600;">Leave Feedback</a>
    </div>
  `)

  await transporter.sendMail({
    from: FROM,
    to: data.recipientEmail,
    subject: `[${data.ticketNumber}] Completed ✓ — ${data.title}`,
    html,
  })
}

export async function sendEmergencyAlert(
  data: TicketEmailData,
  staffEmails: string[]
) {
  const url = `${APP_URL}/admin/dashboard`
  const html = emailWrapper(`
    <div style="background:#FEF2F2;border:2px solid #F64741;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#F64741;text-transform:uppercase;letter-spacing:0.1em;">⚠ Emergency Request</p>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">Immediate Attention Required</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      A new emergency ${data.type.toLowerCase()} request has been submitted at Dairy Block and requires your immediate response.
    </p>
    ${ticketCard({ ...data, url })}
    <a href="${url}" style="display:inline-block;background:#F64741;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:700;">Respond Now →</a>
  `)

  await transporter.sendMail({
    from: FROM,
    to: staffEmails.join(', '),
    subject: `🚨 EMERGENCY [${data.ticketNumber}] — ${data.title}`,
    html,
  })
}

export async function sendNewTicketAlert(
  data: TicketEmailData,
  staffEmails: string[]
) {
  const url = `${APP_URL}/admin/${data.type === 'MAINTENANCE' ? 'maintenance' : 'security'}/${data.ticketNumber}`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">New ${data.type.toLowerCase()} request.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      A new ticket has been submitted and is awaiting review.
    </p>
    ${ticketCard({ ...data, url })}
    <a href="${url}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Review Ticket →</a>
  `)

  await transporter.sendMail({
    from: FROM,
    to: staffEmails.join(', '),
    subject: `[${data.ticketNumber}] New ${data.type} Request — ${data.title}`,
    html,
  })
}
