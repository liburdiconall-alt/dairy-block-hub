/**
 * Run against production to update staff contacts for the resources/team directory page.
 * Usage: npx ts-node -e "require('./scripts/update-staff-contacts.ts')"
 *   OR:  npx tsx scripts/update-staff-contacts.ts
 *
 * Requires DATABASE_URL env var (copy from .env.local or Vercel).
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating staff contacts...')

  // ── Management ──────────────────────────────────────────────────────────────

  // Tiffany Frederiksen — update title to Director of Property Management
  await prisma.staffContact.updateMany({
    where: { name: { contains: 'Tiffany' }, category: 'MANAGEMENT' },
    data: { title: 'Director of Property Management' },
  })
  console.log('Updated Tiffany Frederiksen title')

  // Josh Boyles — Safety Operations Manager
  await prisma.staffContact.upsert({
    where: { id: 'josh-boyles-placeholder' },   // will fall through to create
    update: {
      title: 'Safety Operations Manager',
      category: 'MANAGEMENT',
      email: 'josh.boyles@mcwhinney.com',
      isActive: true,
    },
    create: {
      name: 'Josh Boyles',
      title: 'Safety Operations Manager',
      email: 'josh.boyles@mcwhinney.com',
      category: 'MANAGEMENT',
      sortOrder: 5,
      isActive: true,
    },
  }).catch(async () => {
    // upsert by id fails if id doesn't exist — use findFirst + upsert by name
    const existing = await prisma.staffContact.findFirst({ where: { name: 'Josh Boyles' } })
    if (existing) {
      await prisma.staffContact.update({
        where: { id: existing.id },
        data: { title: 'Safety Operations Manager', category: 'MANAGEMENT', email: 'josh.boyles@mcwhinney.com', isActive: true },
      })
    } else {
      await prisma.staffContact.create({
        data: {
          name: 'Josh Boyles',
          title: 'Safety Operations Manager',
          email: 'josh.boyles@mcwhinney.com',
          category: 'MANAGEMENT',
          sortOrder: 5,
          isActive: true,
        },
      })
    }
    console.log('Upserted Josh Boyles')
  })

  // ── Maintenance ──────────────────────────────────────────────────────────────

  async function upsertMaintenance(name: string, title: string, email: string, sortOrder: number) {
    const existing = await prisma.staffContact.findFirst({ where: { name } })
    if (existing) {
      await prisma.staffContact.update({
        where: { id: existing.id },
        data: { title, category: 'MAINTENANCE', isActive: true },
      })
      console.log(`Updated ${name}`)
    } else {
      await prisma.staffContact.create({
        data: { name, title, email, category: 'MAINTENANCE', sortOrder, isActive: true },
      })
      console.log(`Created ${name}`)
    }
  }

  // NOTE: Update emails below if different from the mcwhinney.com pattern
  await upsertMaintenance('Rick Agema',       'Lead Maintenance Technician', 'rick.agema@mcwhinney.com',       1)
  await upsertMaintenance('Marlon Velasquez', 'Maintenance Technician',      'marlon.velasquez@mcwhinney.com', 2)
  await upsertMaintenance('Reid Maddux',      'Maintenance Technician',      'reid.maddux@mcwhinney.com',      3)

  // ── Security — remove Marjhonna Brown ────────────────────────────────────────

  const marjhonna = await prisma.staffContact.findFirst({
    where: { name: { contains: 'Marjhonna' }, category: 'SECURITY' },
  })
  if (marjhonna) {
    await prisma.staffContact.update({
      where: { id: marjhonna.id },
      data: { isActive: false },
    })
    console.log('Deactivated Marjhonna Brown from Security')
  } else {
    console.log('Marjhonna Brown not found in SECURITY — skipping')
  }

  console.log('\nStaff contacts update complete.')
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
