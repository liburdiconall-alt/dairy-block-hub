import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, Filter } from 'lucide-react'
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'
import type { TicketStatus, Urgency } from '@prisma/client'

export const metadata: Metadata = { title: 'Maintenance Queue' }

interface Props { searchParams: { status?: string; urgency?: string; q?: string } }

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All',              value: ''                },
  { label: 'Submitted',        value: 'SUBMITTED'       },
  { label: 'Under Review',     value: 'UNDER_REVIEW'    },
  { label: 'Approved',         value: 'APPROVED'        },
  { label: 'Assigned',         value: 'ASSIGNED'        },
  { label: 'In Progress',      value: 'IN_PROGRESS'     },
  { label: 'Waiting on Vendor',value: 'WAITING_ON_VENDOR'},
  { label: 'Completed',        value: 'COMPLETED'       },
  { label: 'Closed',           value: 'CLOSED'          },
]

export default async function MaintenancePage({ searchParams }: Props) {
  const requests = await prisma.request.findMany({
    where: {
      type: 'MAINTENANCE',
      ...(searchParams.status  && { status:  searchParams.status  as TicketStatus }),
      ...(searchParams.urgency && { urgency: searchParams.urgency as Urgency      }),
      ...(searchParams.q       && {
        OR: [
          { title:        { contains: searchParams.q, mode: 'insensitive' } },
          { ticketNumber: { contains: searchParams.q, mode: 'insensitive' } },
          { description:  { contains: searchParams.q, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: [
      { urgency: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      submittedBy: { include: { tenantInfo: true } },
      assignedTo:  true,
      maintenanceDetail: true,
    },
  })

  const counts = await prisma.request.groupBy({
    by: ['status'],
    where: { type: 'MAINTENANCE' },
    _count: true,
  })
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count]))

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Admin</p>
          <h1 className="font-display text-3xl font-bold text-db-black">Maintenance Queue</h1>
          <p className="text-db-gray-400 mt-0.5">{requests.length} request{requests.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-db-gray-100">
        {STATUS_FILTERS.map(f => {
          const active = (searchParams.status ?? '') === f.value
          const url = f.value ? `/admin/maintenance?status=${f.value}` : '/admin/maintenance'
          return (
            <Link
              key={f.value}
              href={url}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-db-black text-white'
                  : 'bg-white text-db-gray-500 border border-db-gray-200 hover:border-db-gray-400'
              }`}
            >
              {f.label}
              {f.value && countMap[f.value] ? (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20' : 'bg-db-gray-100 text-db-gray-500'
                }`}>
                  {countMap[f.value]}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="db-card p-16 text-center">
          <p className="text-4xl mb-3">🔧</p>
          <p className="font-display text-xl font-bold text-db-black mb-2">No requests found</p>
          <p className="text-db-gray-400 text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Ticket', 'Category', 'Status', 'Priority', 'Location', 'Tenant', 'Assigned', 'Date', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Location','Tenant'].includes(h) ? 'hidden lg:table-cell' :
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
                    {req.maintenanceDetail?.isPreventive && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded mt-1 inline-block">Preventive</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-600">{req.category}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={req.status} size="sm" /></td>
                  <td className="px-4 py-3.5"><UrgencyBadge urgency={req.urgency} size="sm" /></td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{req.location ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">
                    {req.submittedBy.name}
                    {req.submittedBy.tenantInfo?.unit && (
                      <span className="ml-1 text-db-gray-300">· {req.submittedBy.tenantInfo.unit}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">{req.assignedTo?.name ?? <span className="text-db-marigold">Unassigned</span>}</td>
                  <td className="px-4 py-3.5 hidden xl:table-cell text-xs text-db-gray-400">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link href={`/admin/maintenance/${req.ticketNumber}`} className="text-xs text-db-teal font-medium hover:text-db-teal-dark whitespace-nowrap">
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
