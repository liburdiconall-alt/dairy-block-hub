import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, RotateCcw, FileText } from 'lucide-react'
import { formatDate, formatDateTime, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Event Proposal' }

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const proposal = await prisma.eventProposal.findUnique({
    where:   { proposalNumber: params.id },
    include: {
      submittedBy: { select: { name: true, email: true } },
      reviewedBy:  { select: { name: true } },
      history: {
        include: { changedBy: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!proposal) notFound()
  if (proposal.submittedById !== session.user.id) redirect('/events')

  const steps = [
    { key: 'SUBMITTED',    label: 'Submitted',    icon: FileText     },
    { key: 'UNDER_REVIEW', label: 'Under Review', icon: RotateCcw    },
    { key: 'APPROVED',     label: 'Approved',     icon: CheckCircle2 },
  ]
  const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DENIED']
  const currentIdx  = statusOrder.indexOf(proposal.status)

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black transition-colors">
        <ArrowLeft size={15} /> Back to Events
      </Link>

      {/* Header */}
      <div className="db-card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-db-gray-400 tracking-wider mb-1">{proposal.proposalNumber}</p>
            <h1 className="font-display text-2xl font-bold text-db-black">{proposal.title}</h1>
            <p className="text-sm text-db-gray-400 mt-1">{EVENT_TYPE_LABELS[proposal.type]}</p>
          </div>
          <span className={`db-badge text-sm shrink-0 ${EVENT_STATUS_COLORS[proposal.status]}`}>
            {EVENT_STATUS_LABELS[proposal.status]}
          </span>
        </div>

        {/* Progress tracker */}
        {proposal.status !== 'DENIED' && (
          <div className="flex items-center gap-2 mt-6">
            {steps.map((step, i) => {
              const done    = currentIdx > i
              const active  = currentIdx === i
              const Icon    = step.icon
              return (
                <div key={step.key} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                    {i > 0 && <div className={`h-px flex-1 ${done || active ? 'bg-db-teal' : 'bg-db-gray-200'}`} />}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      done   ? 'bg-db-teal text-white' :
                      active ? 'bg-db-mint border-2 border-db-teal text-db-teal' :
                               'bg-db-gray-100 text-db-gray-300'
                    }`}>
                      <Icon size={14} />
                    </div>
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-db-teal' : done ? 'text-db-gray-600' : 'text-db-gray-300'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {proposal.status === 'DENIED' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-db-red" />
              <p className="text-sm font-semibold text-db-red">Proposal not approved</p>
            </div>
            {proposal.denialReason && (
              <p className="text-sm text-db-gray-600 mt-1">{proposal.denialReason}</p>
            )}
          </div>
        )}

        {proposal.status === 'APPROVED' && proposal.adminNotes && (
          <div className="mt-4 p-4 bg-db-mint-light border border-db-mint rounded-xl">
            <p className="text-xs font-semibold text-db-teal uppercase tracking-wide mb-1">Note from the team</p>
            <p className="text-sm text-db-gray-700">{proposal.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="db-card p-6">
        <h2 className="font-display text-base font-bold text-db-black mb-4">Proposal Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-db-mint-light flex items-center justify-center">
              <Calendar size={14} className="text-db-teal" />
            </div>
            <div>
              <p className="text-xs text-db-gray-400">Date</p>
              <p className="text-sm font-medium text-db-black">{formatDate(proposal.proposedDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-db-mint-light flex items-center justify-center">
              <Clock size={14} className="text-db-teal" />
            </div>
            <div>
              <p className="text-xs text-db-gray-400">Time</p>
              <p className="text-sm font-medium text-db-black">{proposal.startTime} – {proposal.endTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-db-mint-light flex items-center justify-center">
              <MapPin size={14} className="text-db-teal" />
            </div>
            <div>
              <p className="text-xs text-db-gray-400">Location</p>
              <p className="text-sm font-medium text-db-black">{proposal.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-db-mint-light flex items-center justify-center">
              <Users size={14} className="text-db-teal" />
            </div>
            <div>
              <p className="text-xs text-db-gray-400">Expected Attendees</p>
              <p className="text-sm font-medium text-db-black">{proposal.expectedAttendees}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wide mb-2">Description</p>
          <p className="text-sm text-db-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.description}</p>
        </div>
        {proposal.setupNotes && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wide mb-2">Setup Notes</p>
            <p className="text-sm text-db-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.setupNotes}</p>
          </div>
        )}
      </div>

      {/* History */}
      {proposal.history.length > 0 && (
        <div className="db-card p-6">
          <h2 className="font-display text-base font-bold text-db-black mb-4">Activity</h2>
          <div className="space-y-3">
            {proposal.history.map(h => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-db-teal mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-db-gray-700">
                    Status changed to <strong>{h.toStatus ? EVENT_STATUS_LABELS[h.toStatus] : '—'}</strong>
                    {h.changedBy?.name ? ` by ${h.changedBy.name}` : ''}
                  </p>
                  {h.note && <p className="text-xs text-db-gray-400 mt-0.5 italic">{h.note}</p>}
                  <p className="text-xs text-db-gray-300 mt-0.5">{formatDateTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-center text-db-gray-300 pb-4">
        Submitted {formatDateTime(proposal.createdAt)}
      </p>
    </div>
  )
}
