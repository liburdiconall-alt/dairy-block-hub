import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canApprove } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { statusUpdateSchema } from '@/lib/validations'
import { sendStatusUpdateEmail, sendDenialEmail, sendCompletionEmail } from '@/lib/email'
import type { TicketStatus } from '@prisma/client'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = statusUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { status, note, denialReason, scheduledFor } = parsed.data

  // Permission check — only staff can update status
  if (session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Approval/denial requires manager/admin
  if (['APPROVED','DENIED'].includes(status) && !canApprove(session.user.role)) {
    return NextResponse.json({ error: 'Only managers and admins can approve or deny requests.' }, { status: 403 })
  }

  const request = await prisma.request.findUnique({
    where:   { ticketNumber: params.id },
    include: { submittedBy: true },
  })
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const oldStatus = request.status

  const updated = await prisma.request.update({
    where: { ticketNumber: params.id },
    data:  {
      status:      status as TicketStatus,
      denialReason: status === 'DENIED' ? denialReason : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      completedAt:  status === 'COMPLETED' ? new Date() : undefined,
      closedAt:     status === 'CLOSED'    ? new Date() : undefined,
      history: {
        create: {
          fromStatus:  oldStatus,
          toStatus:    status as TicketStatus,
          changedById: session.user.id,
          note,
        },
      },
    },
  })

  // Email notification
  const emailData = {
    ticketNumber: request.ticketNumber,
    title:        request.title,
    type:         request.type,
    category:     request.category,
    status:       status as TicketStatus,
    urgency:      request.urgency,
    recipientName: request.submittedBy.name ?? 'Tenant',
    recipientEmail: request.submittedBy.email,
  }

  if (status === 'DENIED' && denialReason) {
    sendDenialEmail(emailData, denialReason).catch(console.error)
  } else if (status === 'COMPLETED') {
    sendCompletionEmail(emailData).catch(console.error)
  } else {
    sendStatusUpdateEmail(emailData, oldStatus, note).catch(console.error)
  }

  return NextResponse.json(updated)
}
