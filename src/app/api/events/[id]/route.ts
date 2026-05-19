import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const proposal = await prisma.eventProposal.findUnique({
    where:   { proposalNumber: params.id },
    include: {
      submittedBy: { select: { name: true, email: true } },
      reviewedBy:  { select: { name: true } },
      history: {
        include: { changedBy: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Tenants can only see their own
  if (!isStaff(session.user.role) && proposal.submittedById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(proposal)
}
