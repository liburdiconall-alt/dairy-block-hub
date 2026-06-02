import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const handbook = searchParams.get('handbook')

  const sections = await prisma.handbookSection.findMany({
    where: {
      isActive: true,
      ...(handbook ? { handbook } : {}),
    },
    orderBy: [{ handbook: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(sections)
}
