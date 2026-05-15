'use client'
import { useState } from 'react'
import { Send, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  ticketNumber: string
  showInternalToggle?: boolean
}

export function AdminCommentForm({ ticketNumber, showInternalToggle = false }: Props) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${ticketNumber}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isInternal }),
      })
      if (!res.ok) throw new Error('Failed')
      setContent('')
      toast.success(isInternal ? 'Internal note added.' : 'Comment posted.')
      router.refresh()
    } catch {
      toast.error('Could not post comment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className={`rounded-xl p-4 border ${isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-db-gray-50 border-db-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-db-black">
          {isInternal ? '🔒 Internal Note' : 'Add Comment'}
        </label>
        {showInternalToggle && (
          <button
            type="button"
            onClick={() => setIsInternal(!isInternal)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              isInternal ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-white text-db-gray-400 border-db-gray-200 hover:border-db-gray-400'
            }`}
          >
            <Lock size={11} /> {isInternal ? 'Internal' : 'Mark Internal'}
          </button>
        )}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all mb-2 resize-none ${
          isInternal
            ? 'border-yellow-200 bg-yellow-50/50 focus:ring-yellow-200 focus:border-yellow-400'
            : 'border-db-gray-200 bg-white focus:ring-db-teal/30 focus:border-db-teal'
        }`}
        rows={3}
        placeholder={isInternal ? 'Staff-only note (not visible to tenant)…' : 'Update visible to the tenant…'}
        disabled={loading}
      />
      <div className="flex justify-end">
        <button type="submit" disabled={loading || !content.trim()} className="btn-primary text-sm disabled:opacity-50">
          <Send size={13} /> {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
