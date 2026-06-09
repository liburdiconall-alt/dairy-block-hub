import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { staffRegisterSchema } from '@/lib/validations'
import { sendStaffAccessRequestAdminEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = staffRegisterSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    await prisma.user.create({
      data: {
        email:        data.email.toLowerCase(),
        name:         data.name,
        passwordHash,
        role:         data.role,
        status:       'PENDING',
        isActive:     false,
        staffInfo: { create: {} },
      },
    })

    // Notify only ADMIN users — only admins can approve staff accounts
    try {
      const admins = await prisma.user.findMany({
        where:  { role: 'ADMIN', status: 'ACTIVE' },
        select: { email: true },
      })
      const adminEmails = admins.map(a => a.email)
      if (adminEmails.length > 0) {
        await sendStaffAccessRequestAdminEmail({
          applicantName:  data.name,
          applicantEmail: data.email.toLowerCase(),
          requestedRole:  data.role === 'ADMIN' ? 'Administrator' : 'Property Manager',
          adminEmails,
        })
      }
    } catch (emailErr) {
      console.error('[register-staff] email failed:', emailErr)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    console.error('[register-staff]', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
