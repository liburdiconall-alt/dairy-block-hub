import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatDateTime, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { AdminEventControls } from './AdminEventControls'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Review Event Proposal' }

export default async function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') redirect('/admin/dashboard')

  const proposal = await prisma.eventProposal.findUnique({
    where:   { proposalNumber: params.id },
    include: {
      submittedBy: { select: { name: true, email: true, tenantInfo: true } },
      reviewedBy:  { select: { name: true } },
      history: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!proposal) notFound()

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black transition-colors">
        <ArrowLeft size={15} /> Back to Event Proposals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="db-card p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-db-gray-400 tracking-wider mb-1">{proposal.proposalNumber}</p>
                <h1 className="font-display text-2xl font-bold text-db-black">{proposal.title}</h1>
                <p className="text-sm text-db-gray-400 mt-1">{EVENT_TYPE_LABELS[proposal.type]}</p>
              </div>
              <span className={`db-badge shrink-0 ${EVENT_STATUS_COLORS[proposal.status]}`}>
                {EVENT_STATUS_LABELS[proposal.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-db-gray-100 pt-5">
              <div><p className="text-xs text-db-gray-400 mb-0.5">Date</p><p className="font-medium text-db-black">{formatDate(proposal.proposedDate)}</p></div>
              <div><p className="text-xs text-db-gray-400 mb-0.5">Time</p><p className="font-medium text-db-black">{proposal.startTime} – {proposal.endTime}</p></div>
              <div><p className="text-xs text-db-gray-400 mb-0.5">Location</p><p className="font-medium text-db-black">{proposal.location}</p></div>
              <div><p className="text-xs text-db-gray-400 mb-0.5">Expected Attendees</p><p className="font-medium text-db-black">{proposal.expectedAttendees}</p></div>
            </div>
          </div>

          {/* Description */}
          <div className="db-card p-6">
            <h2 className="font-display text-base font-bold text-db-black mb-3">Description</h2>
            <p className="text-sm text-db-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.description}</p>
            {proposal.setupNotes && (
              <>
                <h2 className="font-display text-base font-bold text-db-black mt-5 mb-3">Setup Notes</h2>
                <p className="text-sm text-db-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.setupNotes}</p>
              </>
            )}
          </div>

          {/* Current admin notes / denial reason */}
          {(proposal.adminNotes || proposal.denialReason) && (
            <div className={`db-card p-5 border-l-4 ${proposal.status === 'DENIED' ? 'border-db-red bg-red-50' : 'border-db-teal bg-db-mint-light'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 ${proposal.status === 'DENIED' ? 'text-db-red' : 'text-db-teal'}">
                {proposal.status === 'DENIED' ? 'Denial Reason' : 'Admin Notes'}
              </p>
              <p className="text-sm text-db-gray-700">{proposal.denialReason ?? proposal.adminNotes}</p>
            </div>
          )}

          {/* History */}
          {proposal.history.length > 0 && (
            <div className="db-card p-6">
              <h2 className="font-display text-base font-bold text-db-black mb-4">Activity Log</h2>
              <div className="space-y-3">
                {proposal.history.map(h => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-db-teal mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-db-gray-700">
                        Status changed to <strong>{h.toStatus ? EVENT_STATUS_LABELS[h.toStatus] : '—'}</strong>
                        {h.changedBy?.name ? ` by ${h.changedBy.name}` : ''}
                      </p>
                      {h.note && <p className="text-xs text-db-gray-400 italic mt-0.5">{h.note}</p>}
                      <p className="text-xs text-db-gray-300 mt-0.5">{formatDateTime(h.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Submitter info */}
          <div className="db-card p-5">
            <h3 className="font-display text-sm font-bold text-db-black mb-3">Submitted By</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium text-db-black">{proposal.submittedBy.name}</p>
              <p className="text-xs text-db-gray-400">{proposal.submittedBy.email}</p>
              {proposal.submittedBy.tenantInfo?.unit && (
                <p className="text-xs text-db-gray-400">Unit {proposal.submittedBy.tenantInfo.unit}</p>
              )}
              {proposal.submittedBy.tenantInfo?.company && (
                <p className="text-xs text-db-gray-400">{proposal.submittedBy.tenantInfo.company}</p>
              )}
            </div>
            <p className="text-xs text-db-gray-300 mt-3">Submitted {formatDateTime(proposal.createdAt)}</p>
            {proposal.reviewedBy && (
              <p className="text-xs text-db-gray-400 mt-1">Reviewed by {proposal.reviewedBy.name}</p>
            )}
          </div>

          {/* Action controls */}
          <AdminEventControls proposal={proposal} />
        </div>
      </div>
    </div>
  )
}
