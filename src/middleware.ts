import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { Role } from '@prisma/client'

const STAFF_ROLES: Role[] = ['PROPERTY_MANAGER', 'MAINTENANCE_TECH', 'SECURITY_OFFICER', 'ADMIN', 'VENDOR']

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const role     = token?.role as Role | undefined

    if (!role) return NextResponse.redirect(new URL('/login', req.url))

    // Admin area — staff only
    if (pathname.startsWith('/admin') && !STAFF_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Tenant area — tenants only (staff go to /admin/dashboard)
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/requests')) && STAFF_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/requests/:path*', '/admin/:path*'],
}
