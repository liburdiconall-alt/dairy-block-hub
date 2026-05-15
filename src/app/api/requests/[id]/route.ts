import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const request = await prisma.request.findUnique({
    where:   { ticketNumber: params.id },
    include: {
      submittedBy:       { include: { tenantInfo: true, staffInfo: true } },
      assignedTo:        { include: { tenantInfo: true, staffInfo: true } },
      comments:          {
        where:   session.user.role === 'TENANT' ? { isInternal: false } : {},
        orderBy: { createdAt: 'asc' },
        include: { author: { include: { tenantInfo: true, staffInfo: true } } },
      },
      internalNotes:     { orderBy: { createdAt: 'asc' }, include: { author: true } },
      attachments:       true,
      history:           { orderBy: { createdAt: 'asc' }, include: { changedBy: true } },
      maintenanceDetail: true,
      securityDetail:    true,
    },
  })

  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Tenants can only see their own requests
  if (session.user.role === 'TENANT' && request.submittedById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(request)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  const request = await prisma.request.findUnique({ where: { ticketNumber: params.id } })
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update maintenance detail
  if (body.maintenanceDetail && request.type === 'MAINTENANCE') {
    await prisma.maintenanceDetail.upsert({
      where:  { requestId: request.id },
      update: body.maintenanceDetail,
      create: { requestId: request.id, ...body.maintenanceDetail },
    })
  }

  // Update security detail
  if (body.securityDetail && request.type === 'SECURITY') {
    await prisma.securityDetail.upsert({
      where:  { requestId: request.id },
      update: body.securityDetail,
      create: { requestId: request.id, ...body.securityDetail },
    })
  }

  const updated = await prisma.request.update({
    where: { ticketNumber: params.id },
    data:  {
      ...(body.title       && { title:       body.title       }),
      ...(body.description && { description: body.description }),
      ...(body.location    && { location:    body.location    }),
      ...(body.floor       && { floor:       body.floor       }),
    },
  })

  return NextResponse.json(updated)
}
