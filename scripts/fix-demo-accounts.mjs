import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function deleteUser(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) { console.log(`Not found: ${email}`); return }
  const id = user.id

  // Delete all related records that reference this user
  await prisma.$executeRawUnsafe(`DELETE FROM "TicketHistory" WHERE "changedById" = '${id}'`)
  await prisma.comment.deleteMany({ where: { authorId: id } })
  await prisma.internalNote.deleteMany({ where: { authorId: id } })
  await prisma.notification.deleteMany({ where: { userId: id } })
  await prisma.request.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } })

  await prisma.user.delete({ where: { id } })
  console.log(`Deleted: ${email}`)
}

async function main() {
  await deleteUser('security@dairyblock.com')
  await deleteUser('tech@dairyblock.com')

  const renames = [
    { email: 'tenant@dairyblock.com',  name: 'Demo Tenant Account' },
    { email: 'admin@dairyblock.com',   name: 'Demo Admin Account' },
    { email: 'manager@dairyblock.com', name: 'Demo Property Manager Account' },
  ]
  for (const r of renames) {
    const u = await prisma.user.updateMany({ where: { email: r.email }, data: { name: r.name } })
    console.log(u.count > 0 ? `Renamed ${r.email} → "${r.name}"` : `Not found: ${r.email}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
