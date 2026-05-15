import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentSchema } from '@/lib/validations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isStaff = session.user.role !== 'TENANT'

  const comments = await prisma.comment.findMany({
    where: {
      request:    { ticketNumber: params.id },
      isInternal: isStaff ? undefined : false,
    },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { name: true, role: true } } },
  })

  return NextResponse.json(comments)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { content, isInternal } = parsed.data

  // Tenants can't post internal comments
  if (isInternal && session.user.role === 'TENANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const request = await prisma.request.findUnique({ where: { ticketNumber: params.id } })
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Tenants can only comment on their own requests
  if (session.user.role === 'TENANT' && request.submittedById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const comment = await prisma.comment.create({
    data: {
      requestId:  request.id,
      authorId:   session.user.id,
      content,
      isInternal: isInternal ?? false,
    },
    include: { author: { select: { name: true, role: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
