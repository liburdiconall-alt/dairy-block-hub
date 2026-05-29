import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ count: 0 })

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') return NextResponse.json({ count: 0 })

  const count = await prisma.formSubmission.count({ where: { status: 'SUBMITTED' } })
  return NextResponse.json({ count })
}
