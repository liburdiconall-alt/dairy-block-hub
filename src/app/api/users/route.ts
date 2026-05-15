import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      ...(role && { role: role as any }),
    },
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      phone:     true,
      tenantInfo:{ select: { unit: true, building: true, company: true } },
      staffInfo: { select: { department: true, badge: true } },
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
