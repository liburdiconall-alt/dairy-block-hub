import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

function isAllowed(role?: string) {
  return role === 'ADMIN' || role === 'PROPERTY_MANAGER'
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const handbook = searchParams.get('handbook')

  const sections = await prisma.handbookSection.findMany({
    where: handbook ? { handbook } : undefined,
    orderBy: [{ handbook: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(sections)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { handbook, title, content, sortOrder, isActive } = body
    if (!handbook || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const section = await prisma.handbookSection.create({
      data: { handbook, title, content, sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
    })
    return NextResponse.json(section, { status: 201 })
  } catch (err) {
    console.error('[handbook POST]', err)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}
