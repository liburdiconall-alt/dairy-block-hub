import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { StatusBadge, UrgencyBadge, TypeBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Requests' }

interface Props { searchParams: { status?: string; type?: string } }

export default async function RequestsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const userId  = session!.user.id

  const requests = await prisma.request.findMany({
    where: {
      submittedById: userId,
      ...(searchParams.status && { status: searchParams.status as any }),
      ...(searchParams.type   && { type:   searchParams.type   as any }),
    },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
    include: { assignedTo: true },
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Your Portal</p>
          <h1 className="font-display text-3xl font-bold text-db-black">My Requests</h1>
        </div>
        <Link href="/requests/new" className="btn-teal self-start">
          <PlusCircle size={16} /> New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'MAINTENANCE', 'SECURITY'].map(t => (
          <Link
            key={t}
            href={t ? `/requests?type=${t}` : '/requests'}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (searchParams.type ?? '') === t
                ? 'bg-db-black text-white'
                : 'bg-white text-db-gray-500 border border-db-gray-200 hover:border-db-gray-400'
            }`}
          >
            {t || 'All'} {t && `(${t === 'MAINTENANCE' ? 'Maintenance' : 'Security'})`}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="db-card p-16 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-display text-xl font-bold text-db-black mb-2">No requests found</p>
          <p className="text-db-gray-400 text-sm mb-6">
            {searchParams.type || searchParams.status ? 'Try a different filter.' : "You haven't submitted any requests yet."}
          </p>
          <Link href="/requests/new" className="btn-teal">
            <PlusCircle size={15} /> Submit a Request
          </Link>
        </div>
      ) : (
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Ticket', 'Type', 'Status', 'Priority', 'Location', 'Assigned To', 'Date', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Type','Location','Assigned To'].includes(h) ? 'hidden sm:table-cell' :
                    h === 'Date' ? 'hidden md:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className="table-row-hover">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-db-black">{req.title}</p>
                    <p className="text-xs text-db-gray-400 mt-0.5 font-mono">{req.ticketNumber}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell"><TypeBadge type={req.type} /></td>
                  <td className="px-4 py-3.5"><StatusBadge status={req.status} size="sm" /></td>
                  <td className="px-4 py-3.5"><UrgencyBadge urgency={req.urgency} size="sm" /></td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-db-gray-500">{req.location ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-db-gray-500">{req.assignedTo?.name ?? 'Unassigned'}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-400">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link href={`/requests/${req.ticketNumber}`} className="text-xs text-db-teal font-medium hover:text-db-teal-dark">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
