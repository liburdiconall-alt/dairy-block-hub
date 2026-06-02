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

  const hours = await prisma.buildingHours.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(hours)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAllowed(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const rows: Array<{ id?: string; label: string; hours: string; sortOrder: number }> = await req.json()

    await prisma.$transaction(
      rows.map(row =>
        row.id
          ? prisma.buildingHours.update({
              where: { id: row.id },
              data: { label: row.label, hours: row.hours, sortOrder: row.sortOrder },
            })
          : prisma.buildingHours.create({
              data: { label: row.label, hours: row.hours, sortOrder: row.sortOrder },
            })
      )
    )

    const updated = await prisma.buildingHours.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[hours PUT]', err)
    return NextResponse.json({ error: 'Failed to save hours' }, { status: 500 })
  }
}
