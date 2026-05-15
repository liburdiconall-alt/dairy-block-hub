import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'
import type { TicketStatus, Urgency } from '@prisma/client'

export const metadata: Metadata = { title: 'Security Queue' }

interface Props { searchParams: { status?: string; urgency?: string } }

export default async function SecurityPage({ searchParams }: Props) {
  const requests = await prisma.request.findMany({
    where: {
      type: 'SECURITY',
      ...(searchParams.status  && { status:  searchParams.status  as TicketStatus }),
      ...(searchParams.urgency && { urgency: searchParams.urgency as Urgency      }),
    },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
    include: {
      submittedBy:    { include: { tenantInfo: true } },
      assignedTo:     true,
      securityDetail: true,
    },
  })

  const statuses = ['', 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-3xl font-bold text-db-black">Security Queue</h1>
        <p className="text-db-gray-400 mt-0.5">{requests.length} request{requests.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-db-gray-100">
        {statuses.map(s => {
          const labels: Record<string, string> = {
            '': 'All', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
            ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CLOSED: 'Closed'
          }
          const active = (searchParams.status ?? '') === s
          const url = s ? `/admin/security?status=${s}` : '/admin/security'
          return (
            <Link key={s} href={url} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              active ? 'bg-db-black text-white' : 'bg-white text-db-gray-500 border border-db-gray-200 hover:border-db-gray-400'
            }`}>
              {labels[s]}
            </Link>
          )
        })}
      </div>

      {requests.length === 0 ? (
        <div className="db-card p-16 text-center">
          <p className="text-4xl mb-3">🛡</p>
          <p className="font-display text-xl font-bold text-db-black mb-2">No security requests</p>
          <p className="text-db-gray-400 text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Ticket','Category','Status','Priority','Location','Confidential','Tenant','Assigned','Date',''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Location','Tenant','Confidential'].includes(h) ? 'hidden lg:table-cell' :
                    ['Category','Assigned'].includes(h) ? 'hidden md:table-cell' :
                    h === 'Date' ? 'hidden xl:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className={`table-row-hover ${req.urgency === 'EMERGENCY' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-db-black leading-tight">{req.title}</p>
                    <p className="text-xs text-db-gray-400 mt-0.5 font-mono">{req.ticketNumber}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-600">{req.category}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={req.status} size="sm" /></td>
                  <td className="px-4 py-3.5"><UrgencyBadge urgency={req.urgency} size="sm" /></td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{req.location ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {req.securityDetail?.isConfidential
                      ? <span className="text-xs bg-red-50 text-db-red px-2 py-0.5 rounded-full border border-red-100">Confidential</span>
                      : <span className="text-xs text-db-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{req.submittedBy.name}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">{req.assignedTo?.name ?? <span className="text-db-marigold">Unassigned</span>}</td>
                  <td className="px-4 py-3.5 hidden xl:table-cell text-xs text-db-gray-400">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link href={`/admin/security/${req.ticketNumber}`} className="text-xs text-db-teal font-medium hover:text-db-teal-dark whitespace-nowrap">
                      Manage →
                    </Link>
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
