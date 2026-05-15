import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email:        data.email.toLowerCase(),
        name:         data.name,
        passwordHash,
        role:         'TENANT',
        phone:        data.phone,
        isActive:     true,
        tenantInfo: {
          create: {
            unit:     data.unit,
            building: data.building,
            company:  data.company,
          },
        },
      },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    console.error('[register]', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
