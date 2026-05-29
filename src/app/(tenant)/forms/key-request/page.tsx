'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Key, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  tenantName: string
  suite: string
  company: string
  type: string
  quantity: string
  notes: string
}

export default function KeyRequestForm() {
  const { data: session } = useSession()
  const [form, setForm] = useState<FormData>({
    tenantName: session?.user?.name ?? '',
    suite: '',
    company: '',
    type: 'Access Card',
    quantity: '1',
    notes: '',
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'key-request', formData: form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `KR-${Date.now().toString(36).toUpperCase()}`)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <div className="db-card p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-db-mint-light flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-db-teal" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Request Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your key/access card request has been sent to Property Management. Please allow 72 hours for processing.</p>
          <div className="bg-db-gray-50 rounded-xl px-5 py-3 inline-block">
            <p className="text-xs text-db-gray-400">Reference Number</p>
            <p className="text-lg font-bold text-db-black font-mono">{refNumber}</p>
          </div>
          <div className="pt-2 flex gap-3 justify-center">
            <Link href="/forms" className="btn-ghost">Back to Forms</Link>
            <Link href="/dashboard" className="btn-teal">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <Link href="/forms" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Forms
      </Link>

      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-db-mint-light flex items-center justify-center">
            <Key size={18} className="text-db-teal" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Key / Access Card Request</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Allow 72 hours for requests to be processed.</p>
      </div>

      {/* Fee notice */}
      <div className="flex items-start gap-2 p-4 bg-db-mint-light rounded-xl mb-6">
        <Info size={15} className="text-db-teal flex-shrink-0 mt-0.5" />
        <div className="text-xs text-db-teal-dark space-y-0.5">
          <p><span className="font-semibold">Access Card replacement:</span> $25.00</p>
          <p><span className="font-semibold">Key replacement:</span> $50.00 + costs associated with re-keying</p>
          <p><span className="font-semibold">Technician labor (if applicable):</span> $83.68/hr</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Tenant Name</label>
          <input
            required
            value={form.tenantName}
            onChange={e => update('tenantName', e.target.value)}
            className="db-input"
            placeholder="Your full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Unit / Suite Number</label>
            <input
              required
              value={form.suite}
              onChange={e => update('suite', e.target.value)}
              className="db-input"
              placeholder="e.g. Suite 400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Company Name</label>
            <input
              required
              value={form.company}
              onChange={e => update('company', e.target.value)}
              className="db-input"
              placeholder="Your company"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Type</label>
            <select
              required
              value={form.type}
              onChange={e => update('type', e.target.value)}
              className="db-input"
            >
              <option value="Access Card">Access Card</option>
              <option value="Building Key">Building Key</option>
              <option value="Suite Key">Suite Key</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Quantity</label>
            <input
              required
              type="number"
              min="1"
              max="20"
              value={form.quantity}
              onChange={e => update('quantity', e.target.value)}
              className="db-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Reason / Notes <span className="text-db-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            className="db-textarea"
            rows={3}
            placeholder="Reason for request, lost/damaged card details, special access needs…"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle size={15} className="text-db-red flex-shrink-0" />
            <p className="text-xs text-db-red">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/forms" className="btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className={cn('btn-teal flex-1', loading && 'opacity-70')}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
