import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { generateRefNumber } from '@/lib/forms'
import { sendFormSubmissionConfirmationEmail, sendFormSubmissionAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, formData } = body

  if (!type || !formData) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const refNumber = generateRefNumber(type)

  const submission = await prisma.formSubmission.create({
    data: {
      refNumber,
      type,
      formData,
      submittedById: session.user.id,
    },
    include: { submittedBy: { select: { name: true, email: true } } },
  })

  // Send emails (non-blocking)
  try {
    await sendFormSubmissionConfirmationEmail(submission.submittedBy.email!, submission.submittedBy.name ?? 'Tenant', refNumber, type)
    await sendFormSubmissionAdminEmail(submission.submittedBy.name ?? 'Tenant', submission.submittedBy.email!, refNumber, type, formData)
  } catch {}

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
