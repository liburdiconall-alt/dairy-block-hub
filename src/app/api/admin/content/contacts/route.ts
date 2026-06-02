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

  const contacts = await prisma.staffContact.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { name, title, email, phone, category, sortOrder } = body
    if (!name || !title || !email || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const contact = await prisma.staffContact.create({
      data: { name, title, email, phone: phone || null, category, sortOrder: sortOrder ?? 0 },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    console.error('[contacts POST]', err)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
