import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, User2, Wrench, Paperclip, Clock } from 'lucide-react'
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge'
import { TicketTimeline } from '@/components/ui/TicketTimeline'
import { AdminTicketControls } from '@/components/admin/AdminTicketControls'
import { AdminCommentForm } from '@/components/admin/AdminCommentForm'
import { formatDateTime, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Maintenance ${params.id}` }
}

export default async function AdminMaintenanceDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  const [request, staffList] = await Promise.all([
    prisma.request.findUnique({
      where:   { ticketNumber: params.id },
      include: {
        submittedBy:       { include: { tenantInfo: true, staffInfo: true } },
        assignedTo:        { include: { tenantInfo: true, staffInfo: true } },
        comments:          { orderBy: { createdAt: 'asc' }, include: { author: { include: { tenantInfo: true, staffInfo: true } } } },
        internalNotes:     { orderBy: { createdAt: 'asc' }, include: { author: { include: { tenantInfo: true, staffInfo: true } } } },
        attachments:       { orderBy: { createdAt: 'desc' } },
        history:           { orderBy: { createdAt: 'asc' }, include: { changedBy: { include: { tenantInfo: true, staffInfo: true } } } },
        maintenanceDetail: true,
        securityDetail:    true,
      },
    }),
    prisma.user.findMany({
      where:    { role: { in: ['MAINTENANCE_TECH', 'VENDOR', 'PROPERTY_MANAGER', 'ADMIN'] }, isActive: true },
      select:   { id: true, name: true, role: true, staffInfo: true },
      orderBy:  { name: 'asc' },
    }),
  ])

  if (!request || request.type !== 'MAINTENANCE') notFound()

  const mt = request.maintenanceDetail

  return (
    <div className="animate-fade-in space-y-6">

      {/* Back + header */}
      <div>
        <Link href="/admin/maintenance" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-5 transition-colors">
          <ArrowLeft size={15} /> Maintenance Queue
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <UrgencyBadge urgency={request.urgency} />
              {mt?.isPreventive && <span className="db-badge bg-purple-50 text-purple-700 border border-purple-200">Preventive</span>}
            </div>
            <h1 className="font-display text-2xl font-bold text-db-black">{request.title}</h1>
            <p className="text-xs text-db-gray-400 font-mono mt-0.5">{request.ticketNumber} · {request.category}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Info card */}
          <div className="db-card p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-db-gray-100 mb-5">
              <InfoItem icon={User2}   label="Submitted by" value={request.submittedBy.name ?? '—'} />
              <InfoItem icon={MapPin}  label="Location"     value={`${request.location ?? '—'}${request.floor ? ` · Floor ${request.floor}` : ''}`} />
              <InfoItem icon={Calendar}label="Submitted"    value={formatDate(request.createdAt)} />
              <InfoItem icon={Clock}   label="Last Updated" value={formatDate(request.updatedAt)} />
            </div>
            {request.submittedBy.tenantInfo && (
              <div className="flex gap-3 text-xs text-db-gray-400 pb-4 border-b border-db-gray-100 mb-4">
                <span>Unit: <strong className="text-db-black">{request.submittedBy.tenantInfo.unit ?? '—'}</strong></span>
                <span>Building: <strong className="text-db-black">{request.submittedBy.tenantInfo.building ?? '—'}</strong></span>
                {request.submittedBy.tenantInfo.company && (
                  <span>Company: <strong className="text-db-black">{request.submittedBy.tenantInfo.company}</strong></span>
                )}
              </div>
            )}
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-db-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Work order details */}
          {mt && (
            <div className="db-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={16} className="text-db-teal" />
                <h3 className="font-display font-semibold text-db-black">Work Order Details</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mt.workOrderNumber && <WorkOrderItem label="Work Order #" value={mt.workOrderNumber} />}
                {mt.laborHours      && <WorkOrderItem label="Labor Hours"   value={`${mt.laborHours}h`} />}
                {mt.estimatedCost   && <WorkOrderItem label="Est. Cost"     value={`$${mt.estimatedCost.toFixed(2)}`} />}
                {mt.actualCost      && <WorkOrderItem label="Actual Cost"   value={`$${mt.actualCost.toFixed(2)}`} />}
                {mt.vendorName      && <WorkOrderItem label="Vendor"        value={mt.vendorName} />}
                {mt.vendorContact   && <WorkOrderItem label="Vendor Contact"value={mt.vendorContact} />}
                {mt.materials && (
                  <div className="col-span-full">
                    <p className="text-xs text-db-gray-400 mb-1">Materials</p>
                    <p className="text-sm text-db-black">{mt.materials}</p>
                  </div>
                )}
                {mt.completionNotes && (
                  <div className="col-span-full">
                    <p className="text-xs text-db-gray-400 mb-1">Completion Notes</p>
                    <p className="text-sm text-db-black">{mt.completionNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="db-card p-5">
            <h3 className="font-display font-semibold text-db-black mb-4">Comments & Updates</h3>
            {request.comments.length === 0 ? (
              <p className="text-sm text-db-gray-300 text-center py-4">No comments yet.</p>
            ) : (
              <div className="space-y-4 mb-4">
                {request.comments.map((c) => {
                  const isStaff = c.author.role !== 'TENANT'
                  return (
                    <div key={c.id} className={`rounded-xl p-4 ${isStaff ? 'bg-db-mint-light border-l-4 border-l-db-teal' : 'bg-db-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isStaff ? 'bg-db-teal text-white' : 'bg-db-gray-200 text-db-gray-700'}`}>
                            {c.author.name?.[0] ?? '?'}
                          </div>
                          <span className="text-sm font-medium text-db-black">{c.author.name}</span>
                          {isStaff && <span className="db-badge bg-db-mint-light text-db-teal border border-db-mint text-[10px]">Staff</span>}
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
            <AdminCommentForm ticketNumber={request.ticketNumber} />
          </div>

          {/* Internal notes */}
          {request.internalNotes.length > 0 && (
            <div className="db-card p-5 border-2 border-yellow-200 bg-yellow-50/30">
              <h3 className="font-display font-semibold text-db-black mb-4 flex items-center gap-2">
                <span className="text-yellow-500">🔒</span> Internal Notes
              </h3>
              <div className="space-y-3">
                {request.internalNotes.map((note) => (
                  <div key={note.id} className="bg-white rounded-xl p-3 border border-yellow-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-db-black">{note.author.name}</span>
                      <span className="text-xs text-db-gray-400">{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-db-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {request.attachments.length > 0 && (
            <div className="db-card p-5">
              <h3 className="font-display font-semibold text-db-black mb-4 flex items-center gap-2">
                <Paperclip size={15} className="text-db-gray-400" /> Attachments ({request.attachments.length})
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

        {/* ── Right sidebar ────────────────────────────────────────── */}
        <div className="space-y-4">
          <AdminTicketControls
            request={request as any}
            staffList={staffList as any}
            currentUserId={session!.user.id}
          />

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

function WorkOrderItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-db-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-db-black">{value}</p>
    </div>
  )
}
