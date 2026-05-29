import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2, Store, ChevronRight } from 'lucide-react'

export default async function HandbookPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-db-black">Tenant Handbook</h1>
        <p className="text-db-gray-500 mt-1 text-sm">Building rules, policies, and everything you need to know about Dairy Block.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/handbook/office"
          className="db-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-db-black group-hover:text-db-teal transition-colors">Office Tenants</h2>
            <p className="text-sm text-db-gray-400 mt-1">Policies, procedures, and guidelines for office tenants</p>
          </div>
          <div className="flex items-center gap-1 text-db-teal text-sm font-medium mt-auto">
            View Handbook <ChevronRight size={14} />
          </div>
        </Link>

        <Link href="/handbook/retail"
          className="db-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Store size={22} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-db-black group-hover:text-db-teal transition-colors">Retail Tenants</h2>
            <p className="text-sm text-db-gray-400 mt-1">Policies, procedures, and guidelines for retail tenants</p>
          </div>
          <div className="flex items-center gap-1 text-db-teal text-sm font-medium mt-auto">
            View Handbook <ChevronRight size={14} />
          </div>
        </Link>
      </div>

      <div className="db-card p-5 bg-db-mint-light border-db-mint">
        <p className="text-sm text-db-teal font-medium mb-1">Need to sign your acknowledgement?</p>
        <p className="text-sm text-db-gray-600 mb-3">After reviewing the handbook, submit your acknowledgement to confirm you have read and understood the policies.</p>
        <Link href="/forms/handbook-acknowledgement" className="text-sm font-semibold text-db-teal hover:underline">
          Submit Handbook Acknowledgement →
        </Link>
      </div>
    </div>
  )
}
