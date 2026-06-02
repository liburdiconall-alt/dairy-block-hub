import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const contacts = await prisma.staffContact.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(contacts)
}
