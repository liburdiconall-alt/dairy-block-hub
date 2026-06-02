import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const hours = await prisma.buildingHours.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(hours)
}
