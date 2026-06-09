import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { sendFormStatusUpdateEmail } from '@/lib/email'

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
    include: { submittedBy: { select: { name: true, email: true } } },
  })

  // Notify tenant when their submission is actioned (non-blocking)
  if (['IN_REVIEW', 'COMPLETED', 'DENIED'].includes(status)) {
    try {
      await sendFormStatusUpdateEmail(
        updated.submittedBy.email!,
        updated.submittedBy.name ?? 'Tenant',
        updated.refNumber,
        updated.type,
        status,
        adminNotes,
      )
    } catch (err) {
      console.error('[forms/status] Email send failed:', err)
    }
  }

  return NextResponse.json(updated)
}
