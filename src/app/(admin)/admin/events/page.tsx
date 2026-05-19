import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Event Proposals' }

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const proposals = await prisma.eventProposal.findMany({
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const counts = {
    all:         proposals.length,
    submitted:   proposals.filter(p => p.status === 'SUBMITTED').length,
    under_review:proposals.filter(p => p.status === 'UNDER_REVIEW').length,
    approved:    proposals.filter(p => p.status === 'APPROVED').length,
    denied:      proposals.filter(p => p.status === 'DENIED').length,
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-3xl font-bold text-db-black">Event Proposals</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New',         value: counts.submitted,    color: 'text-db-orange' },
          { label: 'Under Review',value: counts.under_review, color: 'text-amber-600' },
          { label: 'Approved',    value: counts.approved,     color: 'text-db-teal'   },
          { label: 'Denied',      value: counts.denied,       color: 'text-db-red'    },
        ].map(s => (
          <div key={s.label} className="db-card p-4 text-center">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-db-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="db-card overflow-hidden">
        {proposals.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={32} className="text-db-gray-200 mx-auto mb-3" />
            <p className="text-sm text-db-gray-300">No proposals submitted yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Proposal', 'Submitted By', 'Type', 'Status', 'Date', 'Location', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Location', 'Type'].includes(h) ? 'hidden lg:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {proposals.map(p => (
                <tr key={p.id} className="table-row-hover">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-db-black">{p.title}</p>
                    <p className="text-xs text-db-gray-400 mt-0.5">{p.proposalNumber}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-db-gray-700">{p.submittedBy.name}</p>
                    <p className="text-xs text-db-gray-400">{p.submittedBy.email}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{EVENT_TYPE_LABELS[p.type]}</td>
                  <td className="px-4 py-3.5">
                    <span className={`db-badge text-xs ${EVENT_STATUS_COLORS[p.status]}`}>
                      {EVENT_STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-500">{formatDate(p.proposedDate)}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{p.location}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link href={`/admin/events/${p.proposalNumber}`} className="text-xs font-semibold text-db-teal hover:text-db-teal-dark transition-colors">
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
