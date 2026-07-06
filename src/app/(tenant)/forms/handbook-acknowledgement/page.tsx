'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  company: string
  firstName: string
  lastName: string
  phone: string
  email: string
  agreeAcknowledgement: boolean
  signature: string
  date: string
}

export default function HandbookAcknowledgementForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<FormData>({
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    agreeAcknowledgement: false,
    signature: '',
    date: today,
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.agreeAcknowledgement) {
      setError('You must check the acknowledgement box before submitting.')
      return
    }
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    if (form.signature.trim().toLowerCase() !== fullName.toLowerCase()) {
      setError('Your digital signature must match your full name exactly.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'handbook-acknowledgement', formData: form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `HA-${Date.now().toString(36).toUpperCase()}`)
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
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-purple-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Acknowledgement Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your Handbook Acknowledgement has been submitted to Property Management. A copy will be kept on file.</p>
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
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <BookOpen size={18} className="text-purple-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Handbook Acknowledgement</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Required within one week of your move-in date. Review the handbook before signing.</p>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href="/handbook/office" className="flex-1 p-3 rounded-xl border border-db-gray-200 text-sm text-center hover:border-db-teal/30 hover:bg-db-mint-light/30 transition-all">
          View Office Handbook
        </Link>
        <Link href="/handbook/retail" className="flex-1 p-3 rounded-xl border border-db-gray-200 text-sm text-center hover:border-amber-300 hover:bg-amber-50/30 transition-all">
          View Retail Handbook
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Tenant Company</label>
          <input required value={form.company} onChange={e => update('company', e.target.value)} className="db-input" placeholder="Company name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">First Name</label>
            <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} className="db-input" placeholder="First name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Last Name</label>
            <input required value={form.lastName} onChange={e => update('lastName', e.target.value)} className="db-input" placeholder="Last name" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Phone Number</label>
            <input required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">E-Mail Address</label>
            <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className="db-input" placeholder="email@company.com" />
          </div>
        </div>

        <div className="p-4 bg-db-gray-50 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeAcknowledgement}
              onChange={e => update('agreeAcknowledgement', e.target.checked)}
              className="mt-0.5 rounded border-db-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-db-gray-600">
              I acknowledge that I have received, read, and understand the policies and procedures outlined in the Tenant Handbook. These procedures will be communicated with employees, contractors, and visitors when appropriate, and will be followed in accordance with the terms of the Lease Agreement.
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Digital Signature</label>
          <input
            required
            value={form.signature}
            onChange={e => update('signature', e.target.value)}
            className="db-input"
            placeholder="Type your full name as your electronic signature"
          />
          <p className="text-xs text-db-gray-400 mt-1">Must match your first and last name entered above.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Date</label>
          <input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="db-input" />
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
            {loading ? 'Submitting…' : 'Submit Acknowledgement'}
          </button>
        </div>
      </form>
    </div>
  )
}
