/**
 * End-to-end email test script.
 * Sends one email per category to verify SMTP delivery to both tenant and staff inboxes.
 *
 * Usage:
 *   npx tsx scripts/test-email.ts [tenantEmail] [staffEmail]
 *
 * Defaults to the addresses in .env.local if not provided.
 */

import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.test (pulled from Vercel production) then fall back to .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// ─── Config ──────────────────────────────────────────────────────────────────

const TENANT_EMAIL = process.argv[2] ?? (process.env.ADMIN_EMAIL ?? 'conall.liburdi@realberry.com')
const STAFF_EMAIL  = process.argv[3] ?? (process.env.NOTIFY_EMAILS?.split(',')[0] ?? process.env.ADMIN_EMAIL ?? 'conall.liburdi@realberry.com')
const FROM         = process.env.EMAIL_FROM ?? 'Dairy Block Hub <noreply@dairyblock.com>'
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dairy-block-hub.vercel.app'

// ─── Transporter ─────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_SERVER_HOST,
  port:   Number(process.env.EMAIL_SERVER_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wrap(content: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f3f4f6;font-family:Arial,sans-serif;">
<table width="600" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
  <tr><td style="background:#1A1A1A;padding:24px 32px;">
    <div style="font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#C4DBCB;font-weight:600;">Dairy Block</div>
    <div style="font-size:18px;color:#fff;font-weight:700;margin-top:4px;">Tenant Hub</div>
  </td></tr>
  <tr><td style="padding:32px;">${content}</td></tr>
  <tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
    <div style="font-size:12px;color:#9ca3af;">Dairy Block · 1800 Wazee St, Denver, CO 80202</div>
    <div style="font-size:11px;color:#d1d5db;margin-top:4px;">⚠ TEST EMAIL — not a real submission</div>
  </td></tr>
</table></body></html>`
}

async function send(label: string, to: string, subject: string, html: string) {
  process.stdout.write(`  Sending "${label}" → ${to} … `)
  try {
    await transporter.sendMail({ from: FROM, to, subject, html })
    console.log('✓ sent')
    return true
  } catch (err: any) {
    console.log(`✗ FAILED: ${err.message}`)
    return false
  }
}

// ─── Test cases ───────────────────────────────────────────────────────────────

const TESTS: { label: string; to: string; subject: string; html: string }[] = [

  // ── FORM: tenant confirmation ─────────────────────────────────────────────
  {
    label: 'Form submission confirmation (tenant)',
    to: TENANT_EMAIL,
    subject: '[TEST] Dairy Block – Key / Access Card Request Received (DB-KR-TEST-0001)',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">Form Submitted Successfully</h2>
      <p style="color:#666;margin:0 0 20px">Hi Test Tenant, we received your <strong>Key / Access Card Request</strong>.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em">Reference Number</div>
        <div style="font-size:22px;font-weight:700;color:#1A1A1A;margin-top:4px">DB-KR-TEST-0001</div>
      </div>
      <p style="color:#666;font-size:14px">Our property management team will review and follow up if needed.</p>
    `),
  },

  // ── FORM: staff alert ─────────────────────────────────────────────────────
  {
    label: 'Form submission alert (staff)',
    to: STAFF_EMAIL,
    subject: '[TEST] [Dairy Block] New Key / Access Card Request – DB-KR-TEST-0001',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">New Form Submission</h2>
      <p style="color:#666;margin:0 0 20px"><strong>Test Tenant</strong> (${TENANT_EMAIL}) submitted a <strong>Key / Access Card Request</strong>.</p>
      <div style="font-size:13px;color:#888;margin-bottom:4px">Reference: <strong style="color:#1A1A1A">DB-KR-TEST-0001</strong></div>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;border:1px solid #f0f0f0;border-radius:6px;overflow:hidden">
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Company</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">Test Company Inc.</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Key Holder</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">Test Tenant</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Key / Card Type</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">New Access Card</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px">Company Type</td><td style="padding:6px 12px;font-size:13px">Building Tenant</td></tr>
      </table>
      <p style="margin-top:20px;color:#888;font-size:13px">Review in the <a href="${APP_URL}/admin/submissions" style="color:#29967F">admin portal</a>.</p>
    `),
  },

  // ── FORM: pet registration (tenant) ──────────────────────────────────────
  {
    label: 'Pet registration confirmation (tenant)',
    to: TENANT_EMAIL,
    subject: '[TEST] Dairy Block – Pet Registration Received (DB-PR-TEST-0001)',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">Form Submitted Successfully</h2>
      <p style="color:#666;margin:0 0 20px">Hi Test Tenant, we received your <strong>Pet Registration</strong>.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em">Reference Number</div>
        <div style="font-size:22px;font-weight:700;color:#1A1A1A;margin-top:4px">DB-PR-TEST-0001</div>
      </div>
      <div style="background:#fff8e1;border-left:3px solid #f2a53f;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:16px">
        <p style="margin:0;font-size:14px;color:#1A1A1A;">Property Management will review your request and send you a written <strong>approval or denial</strong> by email. Do not bring your pet on-site until you receive written approval.</p>
      </div>
    `),
  },

  // ── FORM: sales report (staff) ────────────────────────────────────────────
  {
    label: 'Sales report alert (staff)',
    to: STAFF_EMAIL,
    subject: '[TEST] [Dairy Block] New Monthly Sales Report – DB-SR-TEST-0001',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">New Form Submission</h2>
      <p style="color:#666;margin:0 0 20px"><strong>Test Retailer</strong> (${TENANT_EMAIL}) submitted a <strong>Monthly Sales Report</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;border:1px solid #f0f0f0;border-radius:6px;overflow:hidden">
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Reporting Period</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">May 2025</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Total Gross Sales</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">$48,250.00</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Improvement Fee Due</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">$965.00</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px">Total Due for Period</td><td style="padding:6px 12px;font-size:13px;font-weight:700">$965.00</td></tr>
      </table>
    `),
  },

  // ── MAINTENANCE REQUEST: tenant confirmation ──────────────────────────────
  {
    label: 'Maintenance request confirmation (tenant)',
    to: TENANT_EMAIL,
    subject: '[TEST] [DB-MT-TEST-0001] Request Received — AC unit noise on floor 4',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">Your request has been received.</h2>
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.7">Hi Test Tenant, we've got your maintenance request and our team is on it. You'll hear from us within <strong>24 hours</strong>.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <span style="font-size:12px;color:#6b7280;font-weight:600">DB-MT-TEST-0001</span>
          <span style="font-size:11px;background:#F2A53F20;color:#F2A53F;padding:2px 8px;border-radius:4px;font-weight:600">Medium</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:#1A1A1A;margin-bottom:4px">AC unit noise on floor 4</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:16px">Maintenance · HVAC</div>
        <a href="${APP_URL}/requests/DB-MT-TEST-0001" style="display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600">View Ticket →</a>
      </div>
    `),
  },

  // ── MAINTENANCE REQUEST: staff alert ─────────────────────────────────────
  {
    label: 'New ticket alert (staff)',
    to: STAFF_EMAIL,
    subject: '[TEST] [DB-MT-TEST-0001] New Maintenance Request — AC unit noise on floor 4',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">New Maintenance Request</h2>
      <p style="color:#666;margin:0 0 20px">A new <strong>Medium</strong> priority maintenance ticket has been submitted by <strong>Test Tenant</strong>.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb">
        <div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:8px">DB-MT-TEST-0001</div>
        <div style="font-size:16px;font-weight:700;color:#1A1A1A;margin-bottom:4px">AC unit noise on floor 4</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:16px">HVAC · Suite 4B</div>
        <a href="${APP_URL}/admin/maintenance/DB-MT-TEST-0001" style="display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600">Review in Admin →</a>
      </div>
    `),
  },

  // ── EVENT APPLICATION: tenant confirmation ────────────────────────────────
  {
    label: 'Event application confirmation (tenant)',
    to: TENANT_EMAIL,
    subject: '[TEST] [DB-EV-TEST-0001] Event Application Received — Summer Pop-Up',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">Your event application has been received.</h2>
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.7">Hi Test Tenant, thanks for applying. Our team reviews all applications and aims to respond within <strong>3 business days</strong>.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb">
        <div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:8px">DB-EV-TEST-0001</div>
        <div style="font-size:16px;font-weight:700;color:#1A1A1A;margin-bottom:4px">Summer Pop-Up</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:16px">Pop-Up · June 28, 2025 · Alley – Middle</div>
        <a href="${APP_URL}/events/DB-EV-TEST-0001" style="display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600">View Application →</a>
      </div>
      <div style="background:#fff8e1;border-left:3px solid #f2a53f;padding:12px 16px;border-radius:0 6px 6px 0">
        <p style="margin:0;font-size:13px;color:#92400e;">Your event is not approved until you receive written approval from property management.</p>
      </div>
    `),
  },

  // ── EVENT APPLICATION: staff alert ────────────────────────────────────────
  {
    label: 'New event application alert (staff)',
    to: STAFF_EMAIL,
    subject: '[TEST] [DB-EV-TEST-0001] New Event Application — Summer Pop-Up',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">New Event Application</h2>
      <p style="color:#666;margin:0 0 20px"><strong>Test Tenant</strong> submitted a new event application.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb">
        <div style="font-size:12px;color:#6b7280;font-weight:600;margin-bottom:8px">DB-EV-TEST-0001</div>
        <div style="font-size:16px;font-weight:700;color:#1A1A1A;margin-bottom:4px">Summer Pop-Up</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:4px">Type: Pop-Up</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:4px">Date: June 28, 2025 · 11:00 AM – 6:00 PM</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:4px">Space: Alley – Middle</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:16px">Expected attendance: 75</div>
        <a href="${APP_URL}/admin/events/DB-EV-TEST-0001" style="display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600">Review Application →</a>
      </div>
    `),
  },

  // ── NEW USER REGISTRATION: staff alert ────────────────────────────────────
  {
    label: 'New tenant registration alert (staff)',
    to: STAFF_EMAIL,
    subject: '[TEST] New Access Request — Test Tenant (tenant@testco.com)',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">New Tenant Access Request</h2>
      <p style="color:#666;margin:0 0 20px">A new tenant has requested access to the Dairy Block Tenant Hub.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #f0f0f0;border-radius:6px;overflow:hidden">
        <tr><td style="padding:8px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Name</td><td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">Test Tenant</td></tr>
        <tr><td style="padding:8px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Email</td><td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">${TENANT_EMAIL}</td></tr>
        <tr><td style="padding:8px 12px;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0">Company</td><td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #f0f0f0">Test Company Inc.</td></tr>
        <tr><td style="padding:8px 12px;color:#888;font-size:13px">Suite</td><td style="padding:8px 12px;font-size:13px">Suite 400</td></tr>
      </table>
      <p style="margin-top:20px">
        <a href="${APP_URL}/admin/users" style="display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600">Review in Admin →</a>
      </p>
    `),
  },

  // ── USER APPROVED: tenant ─────────────────────────────────────────────────
  {
    label: 'Tenant access approved (tenant)',
    to: TENANT_EMAIL,
    subject: '[TEST] Your Dairy Block Hub access has been approved',
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#1A1A1A;">You're in! 🎉</h2>
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.7">Hi Test Tenant, your Dairy Block Tenant Hub access has been approved. You can now sign in to submit requests, track your tickets, and access building resources.</p>
      <p style="margin:20px 0">
        <a href="${APP_URL}/login" style="display:inline-block;background:#29967F;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">Sign In →</a>
      </p>
    `),
  },

]

// ─── Runner ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══ Dairy Block Email Test ══════════════════════════════════')
  console.log(`  Tenant address : ${TENANT_EMAIL}`)
  console.log(`  Staff address  : ${STAFF_EMAIL}`)
  console.log(`  SMTP host      : ${process.env.EMAIL_SERVER_HOST ?? '(not set)'}`)
  console.log(`  Sending from   : ${FROM}`)
  console.log('────────────────────────────────────────────────────────────\n')

  // Verify SMTP connection first
  try {
    await transporter.verify()
    console.log('  SMTP connection verified ✓\n')
  } catch (err: any) {
    console.error(`  SMTP connection FAILED: ${err.message}`)
    console.error('  Check EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD in .env.local\n')
    process.exit(1)
  }

  let passed = 0
  let failed = 0

  for (const test of TESTS) {
    const ok = await send(test.label, test.to, test.subject, test.html)
    if (ok) passed++; else failed++
  }

  console.log('\n────────────────────────────────────────────────────────────')
  console.log(`  Results: ${passed} sent, ${failed} failed out of ${TESTS.length} tests`)
  if (failed === 0) {
    console.log('  All emails sent successfully. Check both inboxes.\n')
  } else {
    console.log('  Some emails failed — check the SMTP config above.\n')
    process.exit(1)
  }
}

main()
