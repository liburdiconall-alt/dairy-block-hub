import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

function isAllowed(role?: string) {
  return role === 'ADMIN' || role === 'PROPERTY_MANAGER'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(announcements)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { title, body: bodyText, type, isActive, expiresAt } = body
    if (!title || !bodyText || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: bodyText,
        type,
        isActive: isActive ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })
    return NextResponse.json(announcement, { status: 201 })
  } catch (err) {
    console.error('[announcements POST]', err)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
