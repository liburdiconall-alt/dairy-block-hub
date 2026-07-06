import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

function isAllowed(role?: string) {
  return role === 'ADMIN' || role === 'PROPERTY_MANAGER'
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    // Convert expiresAt string to Date if provided
    if (body.expiresAt) body.expiresAt = new Date(body.expiresAt)
    const announcement = await prisma.announcement.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(announcement)
  } catch (err) {
    console.error('[announcements PATCH]', err)
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await prisma.announcement.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[announcements DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
