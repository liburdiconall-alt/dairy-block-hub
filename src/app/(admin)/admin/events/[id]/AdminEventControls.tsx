'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Proposal = {
  proposalNumber: string
  status: string
  adminNotes?: string | null
  denialReason?: string | null
}

export function AdminEventControls({ proposal }: { proposal: Proposal }) {
  const router = useRouter()
  const [loading, setLoading]       = useState(false)
  const [adminNotes, setAdminNotes] = useState(proposal.adminNotes ?? '')
  const [denyReason, setDenyReason] = useState(proposal.denialReason ?? '')
  const [showDeny, setShowDeny]     = useState(false)

  async function updateStatus(status: string, extra?: object) {
    setLoading(true)
    await fetch(`/api/events/${proposal.proposalNumber}/status`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status, adminNotes: adminNotes || undefined, ...extra }),
    })
    setLoading(false)
    router.refresh()
  }

  const isDone = proposal.status === 'APPROVED' || proposal.status === 'DENIED'

  return (
    <div className="db-card p-5 space-y-4">
      <h3 className="font-display text-sm font-bold text-db-black">Review Actions</h3>

      {/* Admin notes */}
      <div>
        <label className="block text-xs font-medium text-db-gray-600 mb-1.5">Notes for tenant (optional)</label>
        <textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          rows={3}
          className="db-input resize-none text-sm"
          placeholder="Any conditions, next steps, or additional info for the tenant…"
          disabled={isDone}
        />
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="space-y-2">
          {proposal.status === 'SUBMITTED' && (
            <button
              onClick={() => updateStatus('UNDER_REVIEW')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} /> Mark Under Review
            </button>
          )}

          <button
            onClick={() => updateStatus('APPROVED')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-db-mint-light text-db-teal border border-db-mint text-sm font-semibold hover:bg-db-mint transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> Approve Proposal
          </button>

          {!showDeny ? (
            <button
              onClick={() => setShowDeny(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-db-red border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              <XCircle size={14} /> Deny Proposal
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <label className="block text-xs font-medium text-db-red">Reason for denial (optional)</label>
              <textarea
                value={denyReason}
                onChange={e => setDenyReason(e.target.value)}
                rows={2}
                className="db-input resize-none text-sm border-red-200 focus:border-db-red"
                placeholder="e.g. Space unavailable on that date"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowDeny(false)} className="btn-ghost flex-1 text-sm py-2">Cancel</button>
                <button
                  onClick={() => updateStatus('DENIED', { denialReason: denyReason || undefined })}
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-db-red text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Confirm Denial
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isDone && (
        <div className={`text-center py-3 rounded-xl text-sm font-medium ${
          proposal.status === 'APPROVED'
            ? 'bg-db-mint-light text-db-teal'
            : 'bg-red-50 text-db-red'
        }`}>
          {proposal.status === 'APPROVED' ? 'Proposal Approved' : 'Proposal Denied'}
        </div>
      )}
    </div>
  )
}
