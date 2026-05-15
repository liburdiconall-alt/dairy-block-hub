import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions, STAFF_ROLES } from '@/lib/auth'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || !STAFF_ROLES.includes(session.user.role)) redirect('/login')

  return (
    <div className="flex min-h-screen bg-db-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
