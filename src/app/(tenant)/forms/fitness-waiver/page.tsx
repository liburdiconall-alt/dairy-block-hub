'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  fullName: string
  dob: string
  ecName: string
  ecPhone: string
  medicalConditions: string
  agreeGuidelines: boolean
  agreeRisk: boolean
  signature: string
  date: string
}

export default function FitnessWaiverForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<FormData>({
    fullName: '',
    dob: '',
    ecName: '',
    ecPhone: '',
    medicalConditions: '',
    agreeGuidelines: false,
    agreeRisk: false,
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
    if (!form.agreeGuidelines || !form.agreeRisk) {
      setError('You must agree to both acknowledgements before submitting.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fitness-waiver', formData: form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `FW-${Date.now().toString(36).toUpperCase()}`)
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
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-blue-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Waiver Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your fitness center waiver has been submitted. Property Management will process your access card request shortly.</p>
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
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Dumbbell size={18} className="text-blue-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Fitness Center Waiver</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Required to gain access to the Dairy Block Fitness Center (2nd floor, 1825 Blake St).</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Full Legal Name</label>
          <input required value={form.fullName} onChange={e => update('fullName', e.target.value)} className="db-input" placeholder="As it appears on your ID" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Date of Birth</label>
          <input required type="date" value={form.dob} onChange={e => update('dob', e.target.value)} className="db-input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Emergency Contact Name</label>
            <input required value={form.ecName} onChange={e => update('ecName', e.target.value)} className="db-input" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Emergency Contact Phone</label>
            <input required type="tel" value={form.ecPhone} onChange={e => update('ecPhone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Known Medical Conditions <span className="text-db-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={form.medicalConditions}
            onChange={e => update('medicalConditions', e.target.value)}
            className="db-textarea"
            rows={3}
            placeholder="List any conditions, allergies, or medications relevant to exercise…"
          />
        </div>

        {/* Legal acknowledgements */}
        <div className="space-y-3 p-4 bg-db-gray-50 rounded-2xl">
          <p className="text-xs font-semibold text-db-gray-500 uppercase tracking-wider">Acknowledgements</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeGuidelines}
              onChange={e => update('agreeGuidelines', e.target.checked)}
              className="mt-0.5 rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
            />
            <span className="text-sm text-db-gray-600">I have read and agree to the Fitness Center Guidelines, including all posted rules and equipment usage policies.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeRisk}
              onChange={e => update('agreeRisk', e.target.checked)}
              className="mt-0.5 rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
            />
            <span className="text-sm text-db-gray-600">I understand that use of the Fitness Center and its equipment is at my own risk. Property Management, Owner, and their affiliates assume no liability for injury, accidents, or lost or stolen articles.</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Digital Signature</label>
          <input
            required
            value={form.signature}
            onChange={e => update('signature', e.target.value)}
            className="db-input"
            placeholder="Type your full legal name as your signature"
          />
          <p className="text-xs text-db-gray-400 mt-1">By typing your name above, you agree this serves as your electronic signature.</p>
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
            {loading ? 'Submitting…' : 'Submit Waiver'}
          </button>
        </div>
      </form>
    </div>
  )
}
