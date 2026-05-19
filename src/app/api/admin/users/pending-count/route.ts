import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ count: 0 })

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') {
    return NextResponse.json({ count: 0 })
  }

  const count = await prisma.user.count({ where: { status: 'PENDING' } })
  return NextResponse.json({ count })
}
