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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'conall.liburdi@realberry.com'

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

// ─── Access request / approval emails ────────────────────────────────────────

export async function sendAccessRequestAdminEmail(data: {
  applicantName:  string
  applicantEmail: string
  unit?:          string
  building?:      string
  company?:       string
  adminEmails:    string[]
}) {
  const reviewUrl = `${APP_URL}/admin/users`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">New access request.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      A new tenant has requested access to the Dairy Block Hub and is awaiting your approval.
    </p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:0 0 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;width:80px;">Name</td><td style="padding:4px 0;font-size:13px;color:#1A1A1A;font-weight:600;">${data.applicantName}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Email</td><td style="padding:4px 0;font-size:13px;color:#1A1A1A;">${data.applicantEmail}</td></tr>
        ${data.unit     ? `<tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Unit</td><td style="padding:4px 0;font-size:13px;color:#1A1A1A;">${data.unit}</td></tr>` : ''}
        ${data.building ? `<tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Building</td><td style="padding:4px 0;font-size:13px;color:#1A1A1A;">${data.building}</td></tr>` : ''}
        ${data.company  ? `<tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Company</td><td style="padding:4px 0;font-size:13px;color:#1A1A1A;">${data.company}</td></tr>` : ''}
      </table>
    </div>
    <a href="${reviewUrl}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Review Request →</a>
  `)

  await transporter.sendMail({
    from:    FROM,
    to:      data.adminEmails.join(', '),
    subject: `New Access Request — ${data.applicantName}`,
    html,
  })
}

export async function sendAccessApprovedEmail(data: {
  recipientName:  string
  recipientEmail: string
}) {
  const loginUrl = `${APP_URL}/login`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">You're approved.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, your access request for the Dairy Block Hub has been approved.
      You can now sign in and start submitting requests.
    </p>
    <a href="${loginUrl}" style="display:inline-block;background:#29967F;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">Sign In Now →</a>
    <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;line-height:1.7;">
      Use the email address this was sent to along with the password you chose when registering.
    </p>
  `)

  await transporter.sendMail({
    from:    FROM,
    to:      data.recipientEmail,
    subject: 'Your Dairy Block Hub access has been approved',
    html,
  })
}

export async function sendAccessDeniedEmail(data: {
  recipientName:  string
  recipientEmail: string
  reason?:        string
}) {
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">Access request update.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, after reviewing your request for access to the Dairy Block Hub,
      we were unable to approve your account at this time.
    </p>
    ${data.reason ? `
    <div style="background:#FEF2F2;border-left:3px solid #F64741;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#F64741;text-transform:uppercase;letter-spacing:0.05em;">Reason</p>
      <p style="margin:0;font-size:14px;color:#1A1A1A;">${data.reason}</p>
    </div>` : ''}
    <p style="margin:0;font-size:14px;color:#4B5563;line-height:1.7;">
      If you believe this is a mistake, please reach out to us directly at
      <a href="mailto:hub@dairyblock.com" style="color:#29967F;">hub@dairyblock.com</a>.
    </p>
  `)

  await transporter.sendMail({
    from:    FROM,
    to:      data.recipientEmail,
    subject: 'Update on your Dairy Block Hub access request',
    html,
  })
}

// ─── Event proposal emails ────────────────────────────────────────────────────

export async function sendEventProposalConfirmationEmail(data: {
  recipientName:   string
  recipientEmail:  string
  proposalNumber:  string
  title:           string
  proposedDate:    string
  location:        string
}) {
  const url = `${APP_URL}/events/${data.proposalNumber}`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">Proposal received.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, your event proposal has been submitted and is under review. We'll be in touch shortly.
    </p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">${data.proposalNumber}</p>
      <h3 style="margin:4px 0 12px;font-size:17px;color:#1A1A1A;font-weight:700;">${data.title}</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:3px 0;font-size:13px;color:#6B7280;width:90px;">Date</td><td style="padding:3px 0;font-size:13px;color:#1A1A1A;">${data.proposedDate}</td></tr>
        <tr><td style="padding:3px 0;font-size:13px;color:#6B7280;">Location</td><td style="padding:3px 0;font-size:13px;color:#1A1A1A;">${data.location}</td></tr>
      </table>
    </div>
    <a href="${url}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Track Proposal →</a>
  `)
  await transporter.sendMail({
    from:    FROM,
    to:      data.recipientEmail,
    subject: `[${data.proposalNumber}] Event Proposal Received — ${data.title}`,
    html,
  })
}

export async function sendEventProposalAdminEmail(data: {
  proposalNumber:  string
  title:           string
  type:            string
  proposedDate:    string
  location:        string
  submitterName:   string
  submitterEmail:  string
  adminEmails:     string[]
}) {
  const url = `${APP_URL}/admin/events/${data.proposalNumber}`
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">New event proposal.</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      A new event proposal has been submitted and is awaiting your review.
    </p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">${data.proposalNumber}</p>
      <h3 style="margin:4px 0 12px;font-size:17px;color:#1A1A1A;font-weight:700;">${data.title}</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:3px 0;font-size:13px;color:#6B7280;width:90px;">Type</td><td style="padding:3px 0;font-size:13px;color:#1A1A1A;">${data.type}</td></tr>
        <tr><td style="padding:3px 0;font-size:13px;color:#6B7280;">Date</td><td style="padding:3px 0;font-size:13px;color:#1A1A1A;">${data.proposedDate}</td></tr>
        <tr><td style="padding:3px 0;font-size:13px;color:#6B7280;">Location</td><td style="padding:3px 0;font-size:13px;color:#1A1A1A;">${data.location}</td></tr>
        <tr><td style="padding:3px 0;font-size:13px;color:#6B7280;">Submitted by</td><td style="padding:3px 0;font-size:13px;color:#1A1A1A;">${data.submitterName} (${data.submitterEmail})</td></tr>
      </table>
    </div>
    <a href="${url}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Review Proposal →</a>
  `)
  await transporter.sendMail({
    from:    FROM,
    to:      data.adminEmails.join(', '),
    subject: `[${data.proposalNumber}] New Event Proposal — ${data.title}`,
    html,
  })
}

export async function sendEventStatusUpdateEmail(data: {
  recipientName:  string
  recipientEmail: string
  proposalNumber: string
  title:          string
  newStatus:      string
  adminNotes?:    string
  denialReason?:  string
}) {
  const url = `${APP_URL}/events/${data.proposalNumber}`
  const isApproved = data.newStatus === 'APPROVED'
  const isDenied   = data.newStatus === 'DENIED'

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1A1A1A;font-weight:700;">
      ${isApproved ? 'Your event proposal has been approved.' : isDenied ? 'An update on your event proposal.' : 'Your proposal status has been updated.'}
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Hi ${data.recipientName}, your proposal <strong>${data.title}</strong> (${data.proposalNumber}) is now
      <strong style="color:${isApproved ? '#29967F' : isDenied ? '#F64741' : '#F2A53F'};">${data.newStatus.replace('_', ' ')}</strong>.
    </p>
    ${data.adminNotes ? `
    <div style="background:#E8F2EC;border-left:3px solid #29967F;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#29967F;text-transform:uppercase;letter-spacing:0.05em;">Note from the team</p>
      <p style="margin:0;font-size:14px;color:#1A1A1A;">${data.adminNotes}</p>
    </div>` : ''}
    ${data.denialReason ? `
    <div style="background:#FEF2F2;border-left:3px solid #F64741;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#F64741;text-transform:uppercase;letter-spacing:0.05em;">Reason</p>
      <p style="margin:0;font-size:14px;color:#1A1A1A;">${data.denialReason}</p>
    </div>` : ''}
    <a href="${url}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">View Proposal →</a>
  `)
  await transporter.sendMail({
    from:    FROM,
    to:      data.recipientEmail,
    subject: `[${data.proposalNumber}] Event Proposal ${isApproved ? 'Approved' : isDenied ? 'Update' : 'Status Update'} — ${data.title}`,
    html,
  })
}

export async function sendFormSubmissionConfirmationEmail(
  to: string,
  name: string,
  refNumber: string,
  formType: string,
) {
  const labels: Record<string, string> = {
    KEY_REQUEST:              'Key / Access Card Request',
    FITNESS_WAIVER:           'Fitness Center Waiver',
    PET_REGISTRATION:         'Pet Registration',
    EMERGENCY_COORDINATOR:    'Emergency Coordinator Form',
    HANDBOOK_ACKNOWLEDGEMENT: 'Handbook Acknowledgement',
    RETAIL_SALES_REPORT:      'Monthly Sales Report',
  }
  const label = labels[formType] ?? formType
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Dairy Block – ${label} Received (${refNumber})`,
    html: emailWrapper(`
      <h2 style="color:#1A1A1A;margin:0 0 8px">Form Submitted Successfully</h2>
      <p style="color:#666;margin:0 0 24px">Hi ${name}, we received your <strong>${label}</strong>.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em">Reference Number</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#1A1A1A;letter-spacing:.03em">${refNumber}</p>
      </div>
      <p style="color:#666;font-size:14px">Our property management team will review your submission and follow up if needed. You can track your submission status in the Tenant Hub.</p>
    `),
  })
}

export async function sendFormSubmissionAdminEmail(
  tenantName: string,
  tenantEmail: string,
  refNumber: string,
  formType: string,
  formData: Record<string, unknown>,
) {
  const labels: Record<string, string> = {
    KEY_REQUEST:              'Key / Access Card Request',
    FITNESS_WAIVER:           'Fitness Center Waiver',
    PET_REGISTRATION:         'Pet Registration',
    EMERGENCY_COORDINATOR:    'Emergency Coordinator Form',
    HANDBOOK_ACKNOWLEDGEMENT: 'Handbook Acknowledgement',
    RETAIL_SALES_REPORT:      'Monthly Sales Report',
  }
  const label = labels[formType] ?? formType
  const rows = Object.entries(formData)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;white-space:nowrap">${k.replace(/([A-Z])/g, ' $1').trim()}</td><td style="padding:6px 12px;color:#1A1A1A;font-size:13px;border-bottom:1px solid #f0f0f0">${v}</td></tr>`)
    .join('')

  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Dairy Block] New ${label} – ${refNumber}`,
    html: emailWrapper(`
      <h2 style="color:#1A1A1A;margin:0 0 8px">New Form Submission</h2>
      <p style="color:#666;margin:0 0 20px"><strong>${tenantName}</strong> (${tenantEmail}) submitted a <strong>${label}</strong>.</p>
      <p style="color:#888;font-size:13px;margin:0 0 4px">Reference: <strong style="color:#1A1A1A">${refNumber}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;border-radius:8px;overflow:hidden;border:1px solid #f0f0f0">${rows}</table>
      <p style="margin-top:20px;color:#888;font-size:13px">Review in the admin portal.</p>
    `),
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
