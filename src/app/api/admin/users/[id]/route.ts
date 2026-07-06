import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendAccessApprovedEmail, sendAccessDeniedEmail } from '@/lib/email'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action, reason, newRole } = await req.json()

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Staff accounts (any non-tenant role) can only be approved/denied by ADMIN
  const STAFF_ROLES = ['ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_TECH', 'SECURITY_OFFICER', 'VENDOR']
  if ((action === 'approve' || action === 'deny') && STAFF_ROLES.includes(user.role) && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only administrators can approve or deny staff account requests.' }, { status: 403 })
  }

  if (action === 'approve') {
    await prisma.user.update({
      where: { id },
      data:  { status: 'ACTIVE', isActive: true },
    })
    try {
      await sendAccessApprovedEmail({
        recipientName:  user.name ?? 'Tenant',
        recipientEmail: user.email,
      })
    } catch (e) { console.error('[approve email]', e) }
    return NextResponse.json({ success: true })
  }

  if (action === 'deny') {
    await prisma.user.update({
      where: { id },
      data:  { status: 'DENIED', isActive: false },
    })
    try {
      await sendAccessDeniedEmail({
        recipientName:  user.name ?? 'Tenant',
        recipientEmail: user.email,
        reason,
      })
    } catch (e) { console.error('[deny email]', e) }
    return NextResponse.json({ success: true })
  }

  if (action === 'deactivate') {
    await prisma.user.update({
      where: { id },
      data:  { isActive: false, status: 'DENIED' },
    })
    return NextResponse.json({ success: true })
  }

  if (action === 'reactivate') {
    await prisma.user.update({
      where: { id },
      data:  { isActive: true, status: 'ACTIVE' },
    })
    return NextResponse.json({ success: true })
  }

  if (action === 'changeRole') {
    const validRoles = ['TENANT', 'PROPERTY_MANAGER', 'MAINTENANCE_TECH', 'SECURITY_OFFICER', 'ADMIN', 'VENDOR']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    await prisma.user.update({
      where: { id },
      data:  { role: newRole },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
