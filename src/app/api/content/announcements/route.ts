import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(announcements)
}
