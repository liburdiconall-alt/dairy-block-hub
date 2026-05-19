import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateProposalNumber } from '@/lib/utils'
import { sendEventProposalConfirmationEmail, sendEventProposalAdminEmail } from '@/lib/email'
import { format } from 'date-fns'
import { z } from 'zod'

const createSchema = z.object({
  title:             z.string().min(3, 'Title is required'),
  type:              z.enum(['ACTIVATION','PRIVATE_EVENT','COMMUNITY_EVENT','POP_UP','CORPORATE','OTHER']),
  description:       z.string().min(10, 'Please provide more detail'),
  proposedDate:      z.string().min(1, 'Date is required'),
  startTime:         z.string().min(1, 'Start time is required'),
  endTime:           z.string().min(1, 'End time is required'),
  location:          z.string().min(1, 'Location is required'),
  expectedAttendees: z.coerce.number().min(1, 'Enter expected attendees'),
  setupNotes:        z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const proposalNumber = generateProposalNumber()

    const proposal = await prisma.eventProposal.create({
      data: {
        proposalNumber,
        title:             data.title,
        type:              data.type,
        description:       data.description,
        proposedDate:      new Date(data.proposedDate),
        startTime:         data.startTime,
        endTime:           data.endTime,
        location:          data.location,
        expectedAttendees: data.expectedAttendees,
        setupNotes:        data.setupNotes,
        submittedById:     session.user.id,
      },
      include: { submittedBy: true },
    })

    // Confirmation email to tenant
    try {
      await sendEventProposalConfirmationEmail({
        recipientName:  session.user.name ?? 'Tenant',
        recipientEmail: session.user.email!,
        proposalNumber,
        title:          data.title,
        proposedDate:   format(new Date(data.proposedDate), 'MMMM d, yyyy'),
        location:       data.location,
      })
    } catch (e) { console.error('[event confirm email]', e) }

    // Alert email to admins
    try {
      const admins = await prisma.user.findMany({
        where:  { role: { in: ['ADMIN', 'PROPERTY_MANAGER'] }, status: 'ACTIVE' },
        select: { email: true },
      })
      if (admins.length > 0) {
        await sendEventProposalAdminEmail({
          proposalNumber,
          title:         data.title,
          type:          data.type.replace(/_/g, ' '),
          proposedDate:  format(new Date(data.proposedDate), 'MMMM d, yyyy'),
          location:      data.location,
          submitterName:  session.user.name ?? 'Tenant',
          submitterEmail: session.user.email!,
          adminEmails:   admins.map(a => a.email),
        })
      }
    } catch (e) { console.error('[event admin email]', e) }

    return NextResponse.json({ proposalNumber }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    console.error('[events POST]', err)
    return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = isStaff(session.user.role)

  const proposals = await prisma.eventProposal.findMany({
    where: staff ? {} : { submittedById: session.user.id },
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(proposals)
}
