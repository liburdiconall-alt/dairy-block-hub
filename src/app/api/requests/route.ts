import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateTicketNumber } from '@/lib/utils'
import { newRequestSchema } from '@/lib/validations'
import { sendConfirmationEmail, sendEmergencyAlert, sendNewTicketAlert } from '@/lib/email'
import type { RequestType, Urgency } from '@prisma/client'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type    = searchParams.get('type') as RequestType | null
  const status  = searchParams.get('status')
  const urgency = searchParams.get('urgency') as Urgency | null
  const page    = parseInt(searchParams.get('page') ?? '1')
  const limit   = parseInt(searchParams.get('limit') ?? '20')

  const isStaff = session.user.role !== 'TENANT'

  const requests = await prisma.request.findMany({
    where: {
      ...(!isStaff && { submittedById: session.user.id }),
      ...(type    && { type }),
      ...(status  && { status: status as any }),
      ...(urgency && { urgency }),
    },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
    skip:    (page - 1) * limit,
    take:    limit,
    include: {
      submittedBy: { include: { tenantInfo: true } },
      assignedTo:  true,
    },
  })

  const total = await prisma.request.count({
    where: {
      ...(!isStaff && { submittedById: session.user.id }),
      ...(type   && { type }),
      ...(status && { status: status as any }),
    },
  })

  return NextResponse.json({ requests, total, page, limit })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const raw: Record<string, string> = {}
    formData.forEach((v, k) => { if (k !== 'files') raw[k] = v.toString() })

    const data = newRequestSchema.parse({
      ...raw,
      type:    raw.type ?? 'MAINTENANCE',
      urgency: raw.urgency ?? 'MEDIUM',
    })

    const ticketNumber = generateTicketNumber(data.type as RequestType)
    const isEmergency  = data.urgency === 'EMERGENCY'

    const request = await prisma.request.create({
      data: {
        ticketNumber,
        type:        data.type as RequestType,
        category:    data.category,
        title:       data.title,
        description: data.description,
        urgency:     data.urgency as Urgency,
        status:      'SUBMITTED',
        location:    data.location,
        floor:       data.floor,
        isEmergency,
        submittedById: session.user.id,
        ...(data.type === 'SECURITY' && {
          securityDetail: {
            create: {
              incidentDate:    data.incidentDate ? new Date(data.incidentDate) : null,
              personsInvolved: data.personsInvolved,
              witnesses:       data.witnesses,
            },
          },
        }),
        ...(data.type === 'MAINTENANCE' && {
          maintenanceDetail: { create: {} },
        }),
        history: {
          create: {
            toStatus:   'SUBMITTED',
            changedById: session.user.id,
            note:        'Ticket submitted',
          },
        },
      },
    })

    // Get submitter info for email
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    const emailData = {
      ticketNumber,
      title:         data.title,
      type:          data.type,
      category:      data.category,
      status:        'SUBMITTED' as any,
      urgency:       data.urgency as Urgency,
      recipientName: user?.name ?? 'Tenant',
      recipientEmail:user?.email ?? '',
    }

    // Fire-and-forget emails
    sendConfirmationEmail(emailData).catch(console.error)

    // Alert staff for new tickets
    const staffEmails = await prisma.user.findMany({
      where: { role: { in: ['PROPERTY_MANAGER', 'ADMIN'] }, isActive: true },
      select: { email: true },
    })
    const emails = staffEmails.map(s => s.email)

    if (isEmergency) {
      sendEmergencyAlert(emailData, emails).catch(console.error)
    } else {
      sendNewTicketAlert(emailData, emails).catch(console.error)
    }

    return NextResponse.json({ id: request.id, ticketNumber }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/requests]', err)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
