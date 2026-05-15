'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, UserCheck, Calendar, AlertTriangle, ChevronDown } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'
import toast from 'react-hot-toast'
import type { RequestWithRelations } from '@/types'
import type { TicketStatus } from '@prisma/client'

const NEXT_STATUSES: Record<string, TicketStatus[]> = {
  SUBMITTED:         ['UNDER_REVIEW', 'APPROVED', 'DENIED'],
  UNDER_REVIEW:      ['APPROVED', 'DENIED'],
  APPROVED:          ['ASSIGNED', 'SCHEDULED'],
  DENIED:            [],
  ASSIGNED:          ['IN_PROGRESS', 'SCHEDULED'],
  SCHEDULED:         ['IN_PROGRESS'],
  IN_PROGRESS:       ['WAITING_ON_VENDOR', 'WAITING_ON_TENANT', 'COMPLETED'],
  WAITING_ON_VENDOR: ['IN_PROGRESS', 'COMPLETED'],
  WAITING_ON_TENANT: ['IN_PROGRESS', 'COMPLETED'],
  COMPLETED:         ['CLOSED'],
  CLOSED:            [],
}

interface StaffOption {
  id: string
  name: string | null
  role: string
}

interface Props {
  request: Pick<RequestWithRelations, 'id' | 'ticketNumber' | 'status' | 'urgency' | 'assignedTo'>
  staffList: StaffOption[]
  currentUserId: string
}

export function AdminTicketControls({ request, staffList, currentUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDenialInput, setShowDenialInput] = useState(false)
  const [denialReason, setDenialReason] = useState('')
  const [note, setNote] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('')
  const [selectedStaff, setSelectedStaff] = useState(request.assignedTo?.id ?? '')

  const nextStatuses = NEXT_STATUSES[request.status] ?? []

  async function updateStatus() {
    if (!selectedStatus) return
    if (selectedStatus === 'DENIED' && !denialReason.trim()) {
      toast.error('Please provide a reason for denial.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${request.ticketNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          note:   note || undefined,
          denialReason: selectedStatus === 'DENIED' ? denialReason : undefined,
          scheduledFor: scheduledFor || undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(`Status updated to ${STATUS_LABELS[selectedStatus]}`)
      setSelectedStatus('')
      setNote('')
      setShowDenialInput(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  async function assignStaff() {
    if (!selectedStaff) return
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${request.ticketNumber}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: selectedStaff }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Staff assigned.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to assign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Status control */}
      <div className="db-card p-4">
        <h3 className="text-sm font-semibold text-db-black mb-3">Ticket Status</h3>
        <div className="mb-3">
          <StatusBadge status={request.status} />
        </div>

        {nextStatuses.length > 0 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-db-gray-400 block mb-1.5">Move to</label>
              <select
                value={selectedStatus}
                onChange={e => {
                  setSelectedStatus(e.target.value as TicketStatus)
                  setShowDenialInput(e.target.value === 'DENIED')
                }}
                className="db-input text-sm"
              >
                <option value="">Select new status…</option>
                {nextStatuses.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {showDenialInput && (
              <div>
                <label className="text-xs text-db-gray-400 block mb-1.5">Reason for denial <span className="text-db-red">*</span></label>
                <textarea
                  value={denialReason}
                  onChange={e => setDenialReason(e.target.value)}
                  className="db-textarea text-sm"
                  rows={2}
                  placeholder="Explain why this request is being denied…"
                />
              </div>
            )}

            {selectedStatus === 'SCHEDULED' && (
              <div>
                <label className="text-xs text-db-gray-400 block mb-1.5">Schedule for</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="db-input text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-db-gray-400 block mb-1.5">Note (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="db-textarea text-sm"
                rows={2}
                placeholder="Add a note visible to the tenant…"
              />
            </div>

            <button
              onClick={updateStatus}
              disabled={!selectedStatus || loading}
              className={`w-full btn-primary text-sm ${(!selectedStatus || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating…' : 'Update Status'}
            </button>
          </div>
        )}

        {nextStatuses.length === 0 && (
          <p className="text-xs text-db-gray-400">No further status transitions available.</p>
        )}
      </div>

      {/* Assignment */}
      <div className="db-card p-4">
        <h3 className="text-sm font-semibold text-db-black mb-3 flex items-center gap-2">
          <UserCheck size={14} className="text-db-teal" /> Assignment
        </h3>
        <p className="text-xs text-db-gray-400 mb-1">Currently assigned to</p>
        <p className="text-sm font-medium text-db-black mb-3">
          {request.assignedTo?.name ?? <span className="text-db-marigold">Unassigned</span>}
        </p>
        <div className="space-y-2">
          <select
            value={selectedStaff}
            onChange={e => setSelectedStaff(e.target.value)}
            className="db-input text-sm"
          >
            <option value="">Select staff member…</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role.replace(/_/g, ' ')})
              </option>
            ))}
          </select>
          <button
            onClick={assignStaff}
            disabled={!selectedStaff || loading}
            className={`w-full btn-ghost text-sm ${(!selectedStaff || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      {request.urgency === 'EMERGENCY' && (
        <div className="db-card p-4 border-2 border-db-red/20 bg-red-50/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-db-red" />
            <h3 className="text-sm font-semibold text-db-red">Emergency Active</h3>
          </div>
          <p className="text-xs text-db-gray-500">This ticket requires immediate attention. Respond within 1 hour.</p>
        </div>
      )}
    </div>
  )
}
