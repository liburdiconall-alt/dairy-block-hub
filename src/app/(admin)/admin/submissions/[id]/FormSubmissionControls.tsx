'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

type Submission = {
  refNumber: string
  status: string
  adminNotes?: string | null
}

export function FormSubmissionControls({ submission }: { submission: Submission }) {
  const router = useRouter()
  const [loading, setLoading]       = useState(false)
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes ?? '')

  async function updateStatus(status: string) {
    setLoading(true)
    await fetch(`/api/forms/${submission.refNumber}/status`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status, adminNotes: adminNotes || undefined }),
    })
    setLoading(false)
    router.refresh()
  }

  const isDone = submission.status === 'COMPLETED' || submission.status === 'DENIED'

  return (
    <div className="db-card p-5 space-y-4">
      <h3 className="font-display text-sm font-bold text-db-black">Admin Actions</h3>

      {/* Admin notes */}
      <div>
        <label className="block text-xs font-medium text-db-gray-600 mb-1.5">Internal notes (optional)</label>
        <textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          rows={3}
          className="db-input resize-none text-sm"
          placeholder="Notes about this submission…"
          disabled={isDone}
        />
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="space-y-2">
          {submission.status === 'SUBMITTED' && (
            <button
              onClick={() => updateStatus('IN_REVIEW')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} /> Mark In Review
            </button>
          )}

          <button
            onClick={() => updateStatus('COMPLETED')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-db-mint-light text-db-teal border border-db-mint text-sm font-semibold hover:bg-db-mint transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> Mark Completed
          </button>

          <button
            onClick={() => updateStatus('DENIED')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-db-red border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <XCircle size={14} /> Deny Submission
          </button>
        </div>
      )}

      {isDone && (
        <div className={`text-center py-3 rounded-xl text-sm font-medium ${
          submission.status === 'COMPLETED'
            ? 'bg-db-mint-light text-db-teal'
            : 'bg-red-50 text-db-red'
        }`}>
          {submission.status === 'COMPLETED' ? 'Submission Completed' : 'Submission Denied'}
        </div>
      )}
    </div>
  )
}
