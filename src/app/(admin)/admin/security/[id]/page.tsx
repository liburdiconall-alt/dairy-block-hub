import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, User2, Shield, Paperclip, Clock } from 'lucide-react'
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge'
import { TicketTimeline } from '@/components/ui/TicketTimeline'
import { AdminTicketControls } from '@/components/admin/AdminTicketControls'
import { AdminCommentForm } from '@/components/admin/AdminCommentForm'
import { formatDateTime, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Security ${params.id}` }
}

export default async function AdminSecurityDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  const [request, staffList] = await Promise.all([
    prisma.request.findUnique({
      where:   { ticketNumber: params.id },
      include: {
        submittedBy:    { include: { tenantInfo: true, staffInfo: true } },
        assignedTo:     { include: { tenantInfo: true, staffInfo: true } },
        comments:       { orderBy: { createdAt: 'asc' }, include: { author: { include: { tenantInfo: true, staffInfo: true } } } },
        internalNotes:  { orderBy: { createdAt: 'asc' }, include: { author: { include: { tenantInfo: true, staffInfo: true } } } },
        attachments:    { orderBy: { createdAt: 'desc' } },
        history:        { orderBy: { createdAt: 'asc' }, include: { changedBy: { include: { tenantInfo: true, staffInfo: true } } } },
        securityDetail: true,
      },
    }),
    prisma.user.findMany({
      where:   { role: { in: ['SECURITY_OFFICER', 'PROPERTY_MANAGER', 'ADMIN'] }, isActive: true },
      select:  { id: true, name: true, role: true, staffInfo: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!request || request.type !== 'SECURITY') notFound()

  const sd = request.securityDetail

  return (
    <div className="animate-fade-in space-y-6">

      <div>
        <Link href="/admin/security" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-5 transition-colors">
          <ArrowLeft size={15} /> Security Queue
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <UrgencyBadge urgency={request.urgency} />
              {sd?.isConfidential && <span className="db-badge bg-red-50 text-db-red border border-red-200">🔒 Confidential</span>}
              {sd?.escalatedToMgmt && <span className="db-badge bg-orange-50 text-db-orange border border-orange-200">Escalated</span>}
            </div>
            <h1 className="font-display text-2xl font-bold text-db-black">{request.title}</h1>
            <p className="text-xs text-db-gray-400 font-mono mt-0.5">{request.ticketNumber} · {request.category}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          <div className="db-card p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-db-gray-100 mb-5">
              <InfoItem icon={User2}   label="Submitted by" value={request.submittedBy.name ?? '—'} />
              <InfoItem icon={MapPin}  label="Location"     value={`${request.location ?? '—'}${request.floor ? ` · Floor ${request.floor}` : ''}`} />
              <InfoItem icon={Calendar}label="Submitted"    value={formatDate(request.createdAt)} />
              <InfoItem icon={Clock}   label="Last Updated" value={formatDate(request.updatedAt)} />
            </div>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-db-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Incident report */}
          {sd && (
            <div className="db-card p-5 border-l-4 border-l-db-orange">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-db-orange" />
                <h3 className="font-display font-semibold text-db-black">Incident Report</h3>
                {sd.reportNumber && <span className="text-xs font-mono text-db-gray-400">#{sd.reportNumber}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sd.incidentDate && (
                  <div>
                    <p className="text-xs text-db-gray-400 mb-0.5">Date/Time of Incident</p>
                    <p className="text-sm font-medium text-db-black">{formatDateTime(sd.incidentDate)}</p>
                  </div>
                )}
                {sd.incidentLocation && (
                  <div>
                    <p className="text-xs text-db-gray-400 mb-0.5">Incident Location</p>
                    <p className="text-sm font-medium text-db-black">{sd.incidentLocation}</p>
                  </div>
                )}
                {sd.riskLevel && (
                  <div>
                    <p className="text-xs text-db-gray-400 mb-0.5">Risk Level</p>
                    <p className="text-sm font-medium text-db-black">{sd.riskLevel}</p>
                  </div>
                )}
                {sd.officerBadge && (
                  <div>
                    <p className="text-xs text-db-gray-400 mb-0.5">Officer Badge</p>
                    <p className="text-sm font-medium text-db-black">{sd.officerBadge}</p>
                  </div>
                )}
                {sd.personsInvolved && (
                  <div className="col-span-full">
                    <p className="text-xs text-db-gray-400 mb-0.5">Persons Involved</p>
                    <p className="text-sm text-db-black whitespace-pre-wrap">{sd.personsInvolved}</p>
                  </div>
                )}
                {sd.witnesses && (
                  <div className="col-span-full">
                    <p className="text-xs text-db-gray-400 mb-0.5">Witnesses</p>
                    <p className="text-sm text-db-black whitespace-pre-wrap">{sd.witnesses}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {sd.followUpRequired && <span className="db-badge bg-orange-50 text-db-orange border border-orange-200">Follow-up Required</span>}
                {sd.escalatedToMgmt  && <span className="db-badge bg-red-50 text-db-red border border-red-200">Escalated to Management</span>}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="db-card p-5">
            <h3 className="font-display font-semibold text-db-black mb-4">Comments & Updates</h3>
            {request.comments.length > 0 && (
              <div className="space-y-4 mb-4">
                {request.comments.map((c) => {
                  const isStaff = c.author.role !== 'TENANT'
                  return (
                    <div key={c.id} className={`rounded-xl p-4 ${
                      c.isInternal ? 'bg-yellow-50 border border-yellow-200' :
                      isStaff ? 'bg-db-mint-light border-l-4 border-l-db-teal' : 'bg-db-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isStaff ? 'bg-db-teal text-white' : 'bg-db-gray-200 text-db-gray-700'}`}>
                            {c.author.name?.[0] ?? '?'}
                          </div>
                          <span className="text-sm font-medium text-db-black">{c.author.name}</span>
                          {c.isInternal && <span className="db-badge bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px]">Internal</span>}
                        </div>
                        <span className="text-xs text-db-gray-400">{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-db-gray-700">{c.content}</p>
                    </div>
                  )
                })}
              </div>
            )}
            <AdminCommentForm ticketNumber={request.ticketNumber} showInternalToggle />
          </div>

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="db-card p-5">
              <h3 className="font-display font-semibold text-db-black mb-4 flex items-center gap-2">
                <Paperclip size={15} className="text-db-gray-400" /> Attachments
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {request.attachments.map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-db-gray-50 rounded-lg text-xs text-db-teal hover:bg-db-mint-light transition-colors truncate">
                    📎 {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <AdminTicketControls
            request={request as any}
            staffList={staffList as any}
            currentUserId={session!.user.id}
          />
          <div className="db-card p-4">
            <h3 className="text-sm font-semibold text-db-black mb-4">Ticket History</h3>
            <TicketTimeline history={request.history as any} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-db-teal mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-db-gray-400">{label}</p>
        <p className="text-sm font-medium text-db-black">{value}</p>
      </div>
    </div>
  )
}
