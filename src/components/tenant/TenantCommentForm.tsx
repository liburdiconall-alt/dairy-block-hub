'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  requestId: string
  ticketNumber: string
}

export function TenantCommentForm({ requestId, ticketNumber }: Props) {
  const [content, setContent] = useState('')
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
        body: JSON.stringify({ content, isInternal: false }),
      })
      if (!res.ok) throw new Error('Failed to post comment')
      setContent('')
      toast.success('Comment added.')
      router.refresh()
    } catch {
      toast.error('Could not post comment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="db-card p-4">
      <label className="block text-sm font-semibold text-db-black mb-2">Add a comment</label>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="db-textarea mb-3"
        rows={3}
        placeholder="Any updates, follow-ups, or additional info…"
        disabled={loading}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-teal text-sm disabled:opacity-50"
        >
          <Send size={14} /> {loading ? 'Posting…' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
