# Dairy Block Hub — Project Onboarding

## What this is
A full-stack web portal for tenants and property management staff at Dairy Block Denver (1800 Wazee St, LoDo). Tenants submit forms, view events, and access building resources. Staff review form submissions and manage content through an admin dashboard.

**Live site:** https://dairy-block-hub.vercel.app  
**Repo:** https://github.com/liburdiconall-alt/dairy-block-hub  
**Local path:** `C:\Users\Conall.Liburdi\dairy-block-hub`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Neon (serverless cloud) |
| ORM | Prisma |
| Auth | NextAuth.js v4 |
| Email | Resend SDK (`noreply@dairyblockhub.com`) |
| PDF | jsPDF + jspdf-autotable (client-side) |
| Deployment | Vercel (auto-deploys from `main` branch on GitHub) |
| Node.js | Portable install at `C:\Users\Conall.Liburdi\AppData\Local\node-portable\node-v20.19.2-win-x64` |

---

## Running Locally

```powershell
$env:PATH = "C:\Users\Conall.Liburdi\AppData\Local\node-portable\node-v20.19.2-win-x64;$env:PATH"
Set-Location C:\Users\Conall.Liburdi\dairy-block-hub
npm run dev
```

App runs at http://localhost:3000

**Dev credentials:**
- Tenant: `tenant@dairyblock.com` / `tenant123!`
- Staff/Manager: `manager@dairyblock.com` / `manager123!`

---

## Deploying

Commit your changes, then push from a regular terminal (cmd or PowerShell). Claude Code cannot push to GitHub directly due to sandbox network restrictions.

```cmd
cd C:\Users\Conall.Liburdi\dairy-block-hub
git add .
git commit -m "your message"
git push origin main
```

Vercel picks up the push automatically and deploys within ~2 minutes.

---

## Key Directories

```
src/
  app/
    (tenant)/          # Tenant-facing pages
      dashboard/
      events/          # Event applications
      forms/           # All 6 tenant forms (see below)
      handbook/        # Office + retail handbooks
      resources/       # Building contacts, hours, team directory
      requests/        # Redirects to external Yardi portal
    (admin)/           # Staff portal
      admin/
        dashboard/     # Form submission stats + recent submissions feed
        events/        # Review event applications
        submissions/   # Review all form submissions
        users/         # Approve/deny tenant accounts
        content/       # Edit staff contacts, hours, handbook, announcements
        staff/         # View staff + tenant accounts
        settings/
    (auth)/
      login/
      register/        # Tenant self-registration
      register/staff/  # Staff registration
    api/               # API routes
  lib/
    email.ts           # All email sending (Resend SDK, nodemailer fallback)
    pdf-generation.ts  # Form-replica PDF generation for all 6 form types
    utils.ts           # Shared utilities, EVENT_SPACES array
  components/          # Shared UI components
prisma/
  schema.prisma        # DB schema — source of truth for all models
public/
  docs/                # PDFs served to tenants
scripts/               # One-off DB scripts (run with tsx)
```

---

## Tenant-Facing Forms

All forms POST to `/api/forms`, store a `FormSubmission` record, and send two emails: confirmation to the tenant and an alert to staff.

**Critical rule: all form language (policy text, waiver clauses, checkbox items) must come verbatim from the source PDFs at:**
`C:\Users\Conall.Liburdi\OneDrive - Realberry\Dairy Block-Team - Documents\10. Forms\`
**Never invent or paraphrase — stop and flag if source content can't be found.**

| Form | Route | FormType enum |
|---|---|---|
| Key / Access Card Request | `/forms/key-request` | `KEY_REQUEST` |
| Fitness Center Waiver | `/forms/fitness-waiver` | `FITNESS_WAIVER` |
| Pet Registration | `/forms/pet-registration` | `PET_REGISTRATION` |
| Emergency Coordinator Information | `/forms/emergency-coordinator` | `EMERGENCY_COORDINATOR` |
| Handbook Acknowledgement | `/forms/handbook-acknowledgement` | `HANDBOOK_ACKNOWLEDGEMENT` |
| Monthly Sales Report | `/forms/sales-report` | `RETAIL_SALES_REPORT` |

---

## Staff Dashboard

The staff dashboard (`/admin/dashboard`) shows **form submissions only** — no maintenance or security ticket queues (those were replaced by an external Yardi portal link). The dashboard displays:
- Stats: Total Submissions / Needs Review / In Review / Completed
- Recent Form Submissions table linking to `/admin/submissions/[id]` for review

---

## Maintenance / Security Requests

Tenants are redirected to the **external Yardi CommercialCafe portal** — not handled in-app.
Portal: https://commercialcafe.securecafe3.com/newtenantportal/content2/login/

---

## Email System

Emails are sent via **Resend** (`noreply@dairyblockhub.com`). The sending domain `dairyblockhub.com` is registered on Cloudflare and verified with Resend.

- If `RESEND_API_KEY` is set → uses Resend SDK
- If not set → falls back to nodemailer SMTP (Gmail, legacy)

Staff alert recipients: all active ADMIN / PROPERTY_MANAGER users in the DB. Override with `NOTIFY_EMAILS` env var (comma-separated).

All email functions are in `src/lib/email.ts`.

---

## Environment Variables

Set in Vercel project settings. Also needed in `.env.local` for local development.

| Variable | Value / Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth session signing key |
| `NEXTAUTH_URL` | `https://dairy-block-hub.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as above |
| `RESEND_API_KEY` | Resend API key — get from resend.com |
| `EMAIL_FROM` | `Dairy Block Hub <noreply@dairyblockhub.com>` |
| `EMAIL_SERVER_HOST` | `smtp.gmail.com` (fallback only) |
| `EMAIL_SERVER_PORT` | `587` (fallback only) |
| `EMAIL_SERVER_USER` | `realberrywebsite@gmail.com` (fallback only) |
| `EMAIL_SERVER_PASSWORD` | Gmail app password (fallback only) |
| `NOTIFY_EMAILS` | Optional override for staff alert recipients |

---

## Platform Logins

| Platform | How to log in | Notes |
|---|---|---|
| Claude | conall.liburdi@realberry.com | Primary owner account |
| Vercel | Sign in with GitHub | User ID: NAog8hn1HwAu4mXUQfoDOIcQ |
| GitHub | liburdiconall@gmail.com / RealBerry123! | github.com/liburdiconall-alt |
| Neon | Sign in with GitHub | https://console.neon.tech/app/org-plain-lake-54291576/projects |
| Resend | conall.liburdi@realberry.com | Email address is easily changeable |
| Cloudflare | conall.liburdi@realberry.com | Can invite team members to the project |

---

## Database

**Provider:** Neon (serverless PostgreSQL) — **Schema:** `prisma/schema.prisma`

Key models:
- `User` — tenants and staff (roles: TENANT | PROPERTY_MANAGER | MAINTENANCE_TECH | SECURITY_OFFICER | ADMIN | VENDOR)
- `FormSubmission` — all tenant form submissions (type, status, formData JSON, submittedBy)
- `EventProposal` — event applications
- `StaffContact` — team directory (MANAGEMENT | SECURITY | MAINTENANCE)
- `HandbookSection` — handbook content (managed via `/admin/content`)
- `BuildingHours` — building hours (managed via `/admin/content`)
- `Announcement` — announcements (managed via `/admin/content`)

```powershell
# Run a DB script
$env:PATH = "C:\Users\Conall.Liburdi\AppData\Local\node-portable\node-v20.19.2-win-x64;$env:PATH"
Set-Location C:\Users\Conall.Liburdi\dairy-block-hub
.\node_modules\.bin\tsx.cmd scripts/your-script.ts
```

---

## Known Gotchas

- **npm not in PATH** — always prefix PowerShell sessions with the PATH line above
- **Next.js 15 params** — `params` must be awaited: `const { id } = await params`
- **Claude Code can't `git push`** — network is sandboxed; always push from a real terminal (cmd)
- **Prisma DLL lock** — stop the dev server before running `npm run build` (DLL locks during dev)
- **Python not installed** — use PowerShell `Expand-Archive`/`Compress-Archive` for any `.docx` editing
- **`--legacy-peer-deps`** — required when installing new npm packages

---

## Staff Contacts (as of July 2026)

**Management**
- Scott Vollmer — General Manager — scott.vollmer@realberry.com
- Josh Boyles — Safety Operations Manager — josh.boyles@mcwhinney.com
- Tiffany Frederiksen — Director of Property Management — tiffany.frederiksen@realberry.com
- Liam Walsh — Property Manager — liam.walsh@realberry.com
- Ashley Sinclair — Senior Property Administrator — ashley.sinclair@realberry.com
- Laura Aldrich — Marketing and Events Manager — laura.aldrich@realberry.com

**Maintenance**
- Rick Agema — Lead Maintenance Technician
- Reid Maddux — Maintenance Technician
- Marlon Velasquez — Maintenance Technician

Verify current staff via the admin content manager at `/admin/content`.
