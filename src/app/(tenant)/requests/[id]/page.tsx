import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, User2, Paperclip } from 'lucide-react'
import { StatusBadge, UrgencyBadge, TypeBadge } from '@/components/ui/StatusBadge'
import { TicketTimeline } from '@/components/ui/TicketTimeline'
import { TenantCommentForm } from '@/components/tenant/TenantCommentForm'
import { formatDateTime, formatDate, getExpectedResponse } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Ticket ${params.id}` }
}

export default async function TenantTicketPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  const request = await prisma.request.findUnique({
    where:   { ticketNumber: params.id },
    include: {
      submittedBy: { include: { tenantInfo: true, staffInfo: true } },
      assignedTo:  { include: { tenantInfo: true, staffInfo: true } },
      comments:    {
        where:   { isInternal: false },
        orderBy: { createdAt: 'asc' },
        include: { author: { include: { tenantInfo: true, staffInfo: true } } },
      },
      attachments: { orderBy: { createdAt: 'desc' } },
      history:     {
        orderBy: { createdAt: 'asc' },
        include: { changedBy: { include: { tenantInfo: true, staffInfo: true } } },
      },
      maintenanceDetail: true,
      securityDetail:    true,
    },
  })

  if (!request || request.submittedById !== session!.user.id) notFound()

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">

      <Link href="/requests" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-6 transition-colors">
        <ArrowLeft size={15} /> All Requests
      </Link>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="db-card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={request.type} />
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <StatusBadge status={request.status} />
        </div>
        <h1 className="font-display text-2xl font-bold text-db-black mb-1">{request.title}</h1>
        <p className="text-xs text-db-gray-400 font-mono">{request.ticketNumber}</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-db-gray-100">
          {request.location && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-db-teal mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-db-gray-400">Location</p>
                <p className="text-sm font-medium text-db-black">{request.location}{request.floor ? `, Floor ${request.floor}` : ''}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-db-teal mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-db-gray-400">Submitted</p>
              <p className="text-sm font-medium text-db-black">{formatDate(request.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User2 size={14} className="text-db-teal mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-db-gray-400">Assigned to</p>
              <p className="text-sm font-medium text-db-black">
                {request.assignedTo?.name ?? 'Unassigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Expected response */}
        <div className="mt-4 p-3 bg-db-mint-light rounded-xl">
          <p className="text-xs text-db-teal-dark">
            <span className="font-semibold">Expected response:</span> {getExpectedResponse(request.urgency)}
          </p>
        </div>

        {/* Description */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Description</p>
          <p className="text-sm text-db-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
        </div>

        {/* Denial reason */}
        {request.status === 'DENIED' && request.denialReason && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs font-semibold text-db-red mb-1">Reason for Denial</p>
            <p className="text-sm text-db-black">{request.denialReason}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Comments ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold text-db-black">Updates & Comments</h2>

          {request.comments.length === 0 ? (
            <div className="db-card p-6 text-center">
              <p className="text-db-gray-300 text-2xl mb-2">💬</p>
              <p className="text-sm text-db-gray-400">No comments yet. Add a follow-up below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {request.comments.map((comment) => {
                const isStaff = comment.author.role !== 'TENANT'
                return (
                  <div key={comment.id} className={cn(
                    'db-card p-4',
                    isStaff && 'border-l-4 border-l-db-teal'
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          isStaff ? 'bg-db-teal text-white' : 'bg-db-mint text-db-teal-dark'
                        )}>
                          {comment.author.name?.[0] ?? 'U'}
                        </div>
                        <span className="text-sm font-medium text-db-black">{comment.author.name}</span>
                        {isStaff && <span className="text-xs bg-db-mint-light text-db-teal px-1.5 py-0.5 rounded-md">Staff</span>}
                      </div>
                      <span className="text-xs text-db-gray-400">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-db-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add comment */}
          {!['COMPLETED','CLOSED','DENIED'].includes(request.status) && (
            <TenantCommentForm requestId={request.id} ticketNumber={request.ticketNumber} />
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="db-card p-4">
              <h3 className="text-sm font-semibold text-db-black mb-3 flex items-center gap-2">
                <Paperclip size={14} className="text-db-gray-400" /> Attachments
              </h3>
              <div className="space-y-2">
                {request.attachments.map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-db-teal hover:text-db-teal-dark truncate">
                    📎 {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="db-card p-4">
            <h3 className="text-sm font-semibold text-db-black mb-4">Ticket History</h3>
            <TicketTimeline history={request.history as any} />
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ')
}
