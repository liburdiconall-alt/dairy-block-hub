import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const submission = await prisma.formSubmission.findUnique({
    where: { refNumber: id },
    include: {
      submittedBy: { select: { name: true, email: true, tenantInfo: true } },
      reviewedBy:  { select: { name: true } },
    },
  })

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isStaff = ['ADMIN', 'PROPERTY_MANAGER'].includes(session.user.role)
  if (!isStaff && submission.submittedById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(submission)
}
