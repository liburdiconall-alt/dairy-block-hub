import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEventStatusUpdateEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  status:       z.enum(['UNDER_REVIEW', 'APPROVED', 'DENIED']),
  adminNotes:   z.string().optional(),
  denialReason: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { status, adminNotes, denialReason } = schema.parse(body)

  const proposal = await prisma.eventProposal.findUnique({
    where:   { proposalNumber: params.id },
    include: { submittedBy: true },
  })
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.eventProposal.update({
    where: { proposalNumber: params.id },
    data: {
      status,
      adminNotes:   adminNotes   ?? proposal.adminNotes,
      denialReason: denialReason ?? null,
      reviewedById: session.user.id,
      history: {
        create: {
          fromStatus:  proposal.status,
          toStatus:    status,
          note:        adminNotes ?? denialReason,
          changedById: session.user.id,
        },
      },
    },
  })

  // Email tenant
  try {
    await sendEventStatusUpdateEmail({
      recipientName:  proposal.submittedBy.name ?? 'Tenant',
      recipientEmail: proposal.submittedBy.email,
      proposalNumber: proposal.proposalNumber,
      title:          proposal.title,
      newStatus:      status,
      adminNotes,
      denialReason,
    })
  } catch (e) { console.error('[event status email]', e) }

  return NextResponse.json(updated)
}
