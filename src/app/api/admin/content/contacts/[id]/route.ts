import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

function isAllowed(role?: string) {
  return role === 'ADMIN' || role === 'PROPERTY_MANAGER'
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const contact = await prisma.staffContact.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(contact)
  } catch (err) {
    console.error('[contacts PATCH]', err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await prisma.staffContact.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contacts DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
