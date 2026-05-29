import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { status, adminNotes } = await req.json()

  const updated = await prisma.formSubmission.update({
    where:  { refNumber: params.id },
    data:   {
      status,
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      reviewedById: session.user.id,
    },
  })

  return NextResponse.json(updated)
}
