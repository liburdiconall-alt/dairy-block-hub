import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UserManagementClient } from './UserManagementClient'

export const metadata: Metadata = { title: 'User Management' }

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role = session.user.role
  const canManage = role === 'ADMIN' || role === 'PROPERTY_MANAGER'

  const [pending, active, denied] = await Promise.all([
    prisma.user.findMany({
      where:   { status: 'PENDING' },
      include: { tenantInfo: true, staffInfo: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      where:   { status: 'ACTIVE' },
      include: { tenantInfo: true, staffInfo: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where:   { status: 'DENIED' },
      include: { tenantInfo: true, staffInfo: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  return (
    <UserManagementClient
      pending={pending}
      active={active}
      denied={denied}
      canManage={canManage}
    />
  )
}
