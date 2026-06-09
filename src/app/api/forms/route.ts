import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { generateRefNumber } from '@/lib/forms'
import { sendFormSubmissionConfirmationEmail, sendFormSubmissionAdminEmail } from '@/lib/email'

// Map frontend kebab-case strings → Prisma FormType enum values
const TYPE_MAP: Record<string, string> = {
  'key-request':              'KEY_REQUEST',
  'fitness-waiver':           'FITNESS_WAIVER',
  'pet-registration':         'PET_REGISTRATION',
  'emergency-coordinator':    'EMERGENCY_COORDINATOR',
  'handbook-acknowledgement': 'HANDBOOK_ACKNOWLEDGEMENT',
  'sales-report':             'RETAIL_SALES_REPORT',
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, formData } = body

  if (!type || !formData) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Normalize type to Prisma enum value (accept either format)
  const normalizedType = TYPE_MAP[type] ?? type

  const refNumber = generateRefNumber(normalizedType)

  const submission = await prisma.formSubmission.create({
    data: {
      refNumber,
      type:         normalizedType as any,
      formData,
      submittedById: session.user.id,
    },
    include: { submittedBy: { select: { name: true, email: true } } },
  })

  // Query staff recipients first (outside try/catch — this must always run)
  const staffRecipients = await prisma.user.findMany({
    where:  { role: { in: ['ADMIN', 'PROPERTY_MANAGER'] }, status: 'ACTIVE' },
    select: { email: true },
  })
  const recipientEmails = staffRecipients.map(u => u.email)
  // Tenant confirmation — isolated so a failure doesn't block staff notification
  try {
    await sendFormSubmissionConfirmationEmail(
      submission.submittedBy.email!,
      submission.submittedBy.name ?? 'Tenant',
      refNumber,
      normalizedType,
    )
  } catch (err) {
    console.error('[forms/POST] Tenant confirmation email failed:', err)
  }

  // Staff notification — isolated so a failure doesn't affect the tenant email
  if (recipientEmails.length > 0) {
    try {
      await sendFormSubmissionAdminEmail(
        submission.submittedBy.name ?? 'Tenant',
        submission.submittedBy.email!,
        refNumber,
        normalizedType,
        formData,
        recipientEmails,
      )
    } catch (err) {
      console.error('[forms/POST] Staff notification email failed:', err)
    }
  }

  return NextResponse.json({ refNumber }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isStaff = ['ADMIN', 'PROPERTY_MANAGER'].includes(session.user.role)

  const submissions = await prisma.formSubmission.findMany({
    where: isStaff ? {} : { submittedById: session.user.id },
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(submissions)
}
