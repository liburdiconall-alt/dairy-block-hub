# Dairy Block Hub
### Maintenance & Security Request Hub — Denver, CO

A production-ready, brand-aligned web application for Dairy Block's maintenance and security ticketing operations. Built for tenants, property managers, maintenance technicians, and security staff.

---

## Stack

| Layer          | Technology                            |
|----------------|---------------------------------------|
| Framework      | Next.js 15 (App Router)               |
| Styling        | Tailwind CSS (brand tokens)           |
| Database       | PostgreSQL + Prisma ORM               |
| Auth           | NextAuth.js v4 (JWT + credentials)    |
| Forms          | React Hook Form + Zod                 |
| Email          | Nodemailer (SMTP) or Resend           |
| Icons          | Lucide React                          |
| Deployment     | Vercel / Railway / any Node host      |

---

## Quick Start

### 1. Install dependencies
```bash
cd dairy-block-hub
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Generate with: `openssl rand -base64 32`
- `EMAIL_*` — Your SMTP credentials (or use Resend)

### 3. Set up the database
```bash
# Push schema to your PostgreSQL database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with demo users and sample tickets
npm run db:seed
```

### 4. Start the dev server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials (after seeding)

| Role                | Email                       | Password      |
|---------------------|-----------------------------|---------------|
| Tenant              | tenant@dairyblock.com       | tenant123!    |
| Admin               | admin@dairyblock.com        | admin123!     |
| Property Manager    | manager@dairyblock.com      | manager123!   |
| Maintenance Tech    | tech@dairyblock.com         | tech123!      |
| Security Officer    | security@dairyblock.com     | security123!  |

---

## Application Routes

### Public
- `/` — Branded landing page
- `/login` — Sign in
- `/register` — Tenant account request

### Tenant Portal
- `/dashboard` — Overview, stats, recent requests
- `/requests` — All requests with filters
- `/requests/new` — Submit maintenance or security request
- `/requests/[ticketNumber]` — Ticket detail, comments, history

### Staff Dashboard
- `/admin/dashboard` — Unified overview, emergency alerts, stats
- `/admin/maintenance` — Maintenance queue with status filters
- `/admin/maintenance/[id]` — Full ticket management (status, assign, notes)
- `/admin/security` — Security queue
- `/admin/security/[id]` — Security incident detail + controls
- `/admin/staff` — Staff and tenant roster
- `/admin/settings` — Hub configuration

---

## Role-Based Access

| Action                         | Tenant | Tech | Security | Manager | Admin |
|-------------------------------|--------|------|----------|---------|-------|
| Submit requests               | ✓      | —    | —        | —       | ✓     |
| View own requests             | ✓      | —    | —        | —       | ✓     |
| View all requests             | —      | ✓    | ✓        | ✓       | ✓     |
| Approve / Deny                | —      | —    | —        | ✓       | ✓     |
| Assign tickets                | —      | —    | —        | ✓       | ✓     |
| Update status                 | —      | ✓    | ✓        | ✓       | ✓     |
| Post internal notes           | —      | ✓    | ✓        | ✓       | ✓     |
| View confidential reports     | —      | —    | ✓        | ✓       | ✓     |
| Manage staff/tenants          | —      | —    | —        | ✓       | ✓     |

---

## Brand Design System

### Colors (Tailwind tokens)
```
db-black       #1A1A1A   — Primary text, header, sidebar
db-white       #FFFFFF   — Cards, backgrounds
db-mint        #C4DBCB   — Approved status, accents, shapes
db-mint-light  #E8F2EC   — Tenant portal background accents
db-teal        #29967F   — Interactive elements, CTAs
db-teal-dark   #1E7060   — Hover states
db-orange      #E67C36   — Assignment status, security type
db-marigold    #F2A53F   — Review status, medium urgency
db-red         #F64741   — Emergency, denied, alerts
```

### Typography (Google Fonts approximating brand guide)
| Brand Font (licensed)     | Google Font substitute       | Usage            |
|---------------------------|------------------------------|------------------|
| Jokker Medium/Regular     | Syne (700/800)               | Display headlines|
| Awesome Serif Medium Tall | Playfair Display (500/600)   | Editorial serif  |
| Monas Grotesk Light       | Inter (300/400)              | Body copy        |
| San Clemente (script)     | Dancing Script (500/600)     | Accent moments   |

> **For production:** License and replace with official Dairy Block brand fonts — Jokker, Awesome Serif, Monas Grotesk, San Clemente. Swap the `next/font/google` imports in `src/app/layout.tsx` accordingly.

---

## Email Templates

Branded HTML email templates are defined in `src/lib/email.ts`:

- **Confirmation** — Sent immediately when a request is submitted
- **New Ticket Alert** — Notifies managers/admins of new submissions
- **Status Update** — Sent on every status transition
- **Denial Notice** — Includes the written denial reason
- **Completion** — With tenant satisfaction feedback link
- **Emergency Alert** — High-prominence email to all on-call staff

All emails match Dairy Block's tone: human, warm, clear, and elevated — not robotic.

---

## Database Schema Overview

```
User              — Tenants, staff, vendors (role-based)
Tenant            — Unit, building, company info
Staff             — Department, badge number
Request           — Core ticket (maintenance or security)
MaintenanceDetail — Labor, materials, vendor, cost, work order
SecurityDetail    — Incident info, risk level, confidentiality
Comment           — Tenant + staff visible updates
InternalNote      — Staff-only private notes
Attachment        — File references (photos, videos, docs)
TicketHistory     — Full audit trail of status changes
Notification      — Email notification log
```

---

## Deployment

### Vercel (recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, EMAIL_*
```

### Railway (database + app)
1. Create a PostgreSQL database on Railway
2. Copy the `DATABASE_URL` connection string
3. Deploy the app to Railway or Vercel
4. Run `npm run db:push && npm run db:seed` via Railway shell

### Environment Variables (production)
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://hub.dairyblock.com
NEXTAUTH_SECRET=<generated>
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=<resend-api-key>
EMAIL_FROM=Dairy Block Hub <noreply@dairyblock.com>
NEXT_PUBLIC_APP_URL=https://hub.dairyblock.com
```

---

## Bonus Architecture (Placeholders)

The following features are architected or stubbed and ready for development:

| Feature                           | Status      | Notes                                          |
|-----------------------------------|-------------|------------------------------------------------|
| QR Code submission                | Placeholder | `/requests/new?source=qr&location=...`         |
| Preventive maintenance scheduling | DB field    | `isPreventive` flag on `MaintenanceDetail`     |
| Security incident analytics       | DB ready    | Aggregate `SecurityDetail` risk levels         |
| Heatmap of recurring issues       | Planned     | Group by `location` + `floor` + `category`     |
| Tenant satisfaction rating        | Placeholder | `/requests/[id]?rate=true` route stub          |
| Vendor portal                     | Role ready  | `VENDOR` role defined, UI pending              |
| Mobile app                        | Planned     | API routes are REST-ready for native clients   |
| AI ticket categorization          | Planned     | Feed `title + description` to Claude API       |
| Emergency escalation workflow     | Partial     | Emergency alerts fire immediately; escalation chain pending |

---

## Directory Structure

```
dairy-block-hub/
├── prisma/
│   ├── schema.prisma          # Full database schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register (split-panel layout)
│   │   ├── (tenant)/          # Tenant portal (dashboard, requests)
│   │   ├── (admin)/admin/     # Staff hub (dashboard, maintenance, security)
│   │   ├── api/               # REST API routes
│   │   ├── layout.tsx         # Root layout (fonts, providers)
│   │   ├── page.tsx           # Branded landing page
│   │   └── globals.css        # Tailwind + brand CSS
│   ├── components/
│   │   ├── ui/                # StatusBadge, StatsCard, EmergencyAlert, Timeline
│   │   ├── layout/            # TenantNav, AdminSidebar
│   │   ├── tenant/            # TenantCommentForm
│   │   └── admin/             # AdminTicketControls, AdminCommentForm
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config + role helpers
│   │   ├── db.ts              # Prisma singleton
│   │   ├── email.ts           # Branded email templates + Nodemailer
│   │   ├── utils.ts           # Status/urgency maps, ticket number gen
│   │   └── validations.ts     # Zod schemas
│   ├── middleware.ts           # Route protection + role redirect
│   └── types/index.ts         # TypeScript types + NextAuth extensions
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Contact

**Dairy Block** · 1800 Wazee St, Denver, CO 80202  
LoDo's community of makers.  
[dairyblock.com](https://dairyblock.com)
