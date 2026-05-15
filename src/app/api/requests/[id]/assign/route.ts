import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { assignSchema } from '@/lib/validations'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = assignSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { assignedToId, note } = parsed.data

  const assignee = await prisma.user.findUnique({ where: { id: assignedToId } })
  if (!assignee) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })

  const request = await prisma.request.findUnique({ where: { ticketNumber: params.id } })
  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  const updated = await prisma.request.update({
    where: { ticketNumber: params.id },
    data:  {
      assignedToId,
      status: request.status === 'SUBMITTED' || request.status === 'APPROVED' ? 'ASSIGNED' : request.status,
      history: {
        create: {
          fromStatus:  request.status,
          toStatus:    request.status === 'SUBMITTED' || request.status === 'APPROVED' ? 'ASSIGNED' : request.status,
          changedById: session.user.id,
          note:        note ?? `Assigned to ${assignee.name}`,
        },
      },
    },
  })

  return NextResponse.json(updated)
}
