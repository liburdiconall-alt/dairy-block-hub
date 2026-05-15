import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import type { Role } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.isActive) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role as Role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
}

// Role helpers
export const STAFF_ROLES: Role[] = [
  'PROPERTY_MANAGER',
  'MAINTENANCE_TECH',
  'SECURITY_OFFICER',
  'ADMIN',
  'VENDOR',
]

export function isStaff(role: Role) {
  return STAFF_ROLES.includes(role)
}

export function canManageRequests(role: Role) {
  return ['PROPERTY_MANAGER', 'ADMIN', 'MAINTENANCE_TECH', 'SECURITY_OFFICER'].includes(role)
}

export function canApprove(role: Role) {
  return ['PROPERTY_MANAGER', 'ADMIN'].includes(role)
}
