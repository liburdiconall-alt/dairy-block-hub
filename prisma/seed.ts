import { PrismaClient, Role, Department, RequestType, Urgency, TicketStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Dairy Block Hub...')

  // Admin user
  const adminHash = await bcrypt.hash('admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dairyblock.com' },
    update: {},
    create: {
      email: 'admin@dairyblock.com',
      name: 'Admin User',
      passwordHash: adminHash,
      role: Role.ADMIN,
      staffInfo: { create: { department: Department.MANAGEMENT } },
    },
  })

  // Property manager
  const pmHash = await bcrypt.hash('manager123!', 12)
  const pm = await prisma.user.upsert({
    where: { email: 'manager@dairyblock.com' },
    update: {},
    create: {
      email: 'manager@dairyblock.com',
      name: 'Sarah Kimura',
      passwordHash: pmHash,
      role: Role.PROPERTY_MANAGER,
      staffInfo: { create: { department: Department.MANAGEMENT } },
    },
  })

  // Maintenance tech
  const mtHash = await bcrypt.hash('tech123!', 12)
  const tech = await prisma.user.upsert({
    where: { email: 'tech@dairyblock.com' },
    update: {},
    create: {
      email: 'tech@dairyblock.com',
      name: 'Marcus Johnson',
      passwordHash: mtHash,
      role: Role.MAINTENANCE_TECH,
      staffInfo: { create: { department: Department.MAINTENANCE, badge: 'MT-001' } },
    },
  })

  // Security officer
  const soHash = await bcrypt.hash('security123!', 12)
  const officer = await prisma.user.upsert({
    where: { email: 'security@dairyblock.com' },
    update: {},
    create: {
      email: 'security@dairyblock.com',
      name: 'DeShawn Rivera',
      passwordHash: soHash,
      role: Role.SECURITY_OFFICER,
      staffInfo: { create: { department: Department.SECURITY, badge: 'SO-004' } },
    },
  })

  // Tenant
  const tenantHash = await bcrypt.hash('tenant123!', 12)
  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@dairyblock.com' },
    update: {},
    create: {
      email: 'tenant@dairyblock.com',
      name: 'Alex Moreno',
      passwordHash: tenantHash,
      role: Role.TENANT,
      tenantInfo: {
        create: { unit: '4B', building: 'West Wing', company: 'Bloom Studio' },
      },
    },
  })

  // Sample maintenance request
  await prisma.request.upsert({
    where: { ticketNumber: 'DB-2024-0001' },
    update: {},
    create: {
      ticketNumber: 'DB-2024-0001',
      type: RequestType.MAINTENANCE,
      category: 'HVAC',
      title: 'AC unit making loud noise on floor 4',
      description: 'The ceiling HVAC unit in Suite 4B has been making a loud rattling noise for the past two days. It gets louder when the cooling first kicks on.',
      urgency: Urgency.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      location: 'Suite 4B',
      floor: '4',
      submittedById: tenant.id,
      assignedToId: tech.id,
      maintenanceDetail: {
        create: {
          laborHours: 2,
          materials: 'Belt tensioner, filter',
          estimatedCost: 150,
        },
      },
      history: {
        create: [
          { fromStatus: null, toStatus: TicketStatus.SUBMITTED, changedById: tenant.id, note: 'Ticket submitted' },
          { fromStatus: TicketStatus.SUBMITTED, toStatus: TicketStatus.APPROVED, changedById: pm.id, note: 'Approved for repair' },
          { fromStatus: TicketStatus.APPROVED, toStatus: TicketStatus.IN_PROGRESS, changedById: tech.id, note: 'Technician on-site' },
        ],
      },
    },
  })

  // Sample security request
  await prisma.request.upsert({
    where: { ticketNumber: 'DB-2024-0002' },
    update: {},
    create: {
      ticketNumber: 'DB-2024-0002',
      type: RequestType.SECURITY,
      category: 'Access Control Issue',
      title: 'Badge not working on Level P2 door',
      description: 'My access badge stopped working at the P2 parking level door this morning. I had to wait for another tenant to let me in.',
      urgency: Urgency.HIGH,
      status: TicketStatus.ASSIGNED,
      location: 'Parking Level P2',
      floor: 'P2',
      submittedById: tenant.id,
      assignedToId: officer.id,
      securityDetail: {
        create: {
          riskLevel: 'Medium',
          followUpRequired: true,
        },
      },
      history: {
        create: [
          { fromStatus: null, toStatus: TicketStatus.SUBMITTED, changedById: tenant.id, note: 'Ticket submitted' },
          { fromStatus: TicketStatus.SUBMITTED, toStatus: TicketStatus.ASSIGNED, changedById: officer.id, note: 'Assigned to security' },
        ],
      },
    },
  })

  console.log('Seed complete!')
  console.log('\nTest credentials:')
  console.log('  Admin:    admin@dairyblock.com / admin123!')
  console.log('  Manager:  manager@dairyblock.com / manager123!')
  console.log('  Tech:     tech@dairyblock.com / tech123!')
  console.log('  Security: security@dairyblock.com / security123!')
  console.log('  Tenant:   tenant@dairyblock.com / tenant123!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
