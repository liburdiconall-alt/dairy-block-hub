'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle as AlertCircleIcon, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoordinatorInfo {
  name: string
  title: string
  cellPhone: string
  workPhone: string
  email: string
}

interface FormData {
  companyName: string
  floorSuite: string
  numEmployees: string
  specialNeeds: string
  primary: CoordinatorInfo
  alternate: CoordinatorInfo
}

function CoordinatorFields({ label, prefix, data, onChange }: {
  label: string
  prefix: string
  data: CoordinatorInfo
  onChange: (field: keyof CoordinatorInfo, value: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Name</label>
          <input required value={data.name} onChange={e => onChange('name', e.target.value)} className="db-input" placeholder="Full name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Title / Position</label>
          <input required value={data.title} onChange={e => onChange('title', e.target.value)} className="db-input" placeholder="Job title" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Cell Phone</label>
          <input required type="tel" value={data.cellPhone} onChange={e => onChange('cellPhone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Work Phone</label>
          <input required type="tel" value={data.workPhone} onChange={e => onChange('workPhone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-db-black mb-1.5">Email</label>
          <input required type="email" value={data.email} onChange={e => onChange('email', e.target.value)} className="db-input" placeholder="email@company.com" />
        </div>
      </div>
    </div>
  )
}

const emptyCoord = (): CoordinatorInfo => ({ name: '', title: '', cellPhone: '', workPhone: '', email: '' })

export default function EmergencyCoordinatorForm() {
  const [form, setForm] = useState<FormData>({
    companyName: '',
    floorSuite: '',
    numEmployees: '',
    specialNeeds: '',
    primary: emptyCoord(),
    alternate: emptyCoord(),
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function updateCoord(which: 'primary' | 'alternate', field: keyof CoordinatorInfo, value: string) {
    setForm(prev => ({ ...prev, [which]: { ...prev[which], [field]: value } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'emergency-coordinator', formData: form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `EC-${Date.now().toString(36).toUpperCase()}`)
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
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-db-red" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Form Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your Emergency Coordinator information has been submitted to Property Management and added to the building emergency records.</p>
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
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircleIcon size={18} className="text-db-red" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Emergency Coordinator Form</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Designate emergency coordinators for your floor. Required within one week of move-in.</p>
      </div>

      <div className="flex items-start gap-2 p-4 bg-db-mint-light rounded-xl mb-6">
        <Info size={15} className="text-db-teal flex-shrink-0 mt-0.5" />
        <p className="text-xs text-db-teal-dark">Designate one Emergency Coordinator per every 20 on-site staff members. The alternate coordinator steps in if the primary is absent during an emergency or evacuation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-db-black mb-1.5">Company Name</label>
            <input required value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} className="db-input" placeholder="Your company name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Floor / Suite Number</label>
            <input required value={form.floorSuite} onChange={e => setForm(p => ({ ...p, floorSuite: e.target.value }))} className="db-input" placeholder="e.g. 4th Floor, Suite 400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Number of Employees on Floor</label>
            <input required type="number" min="1" value={form.numEmployees} onChange={e => setForm(p => ({ ...p, numEmployees: e.target.value }))} className="db-input" placeholder="e.g. 25" />
          </div>
        </div>

        <div className="border-t border-db-gray-100 pt-5">
          <CoordinatorFields
            label="Primary Emergency Coordinator"
            prefix="primary"
            data={form.primary}
            onChange={(field, value) => updateCoord('primary', field, value)}
          />
        </div>

        <div className="border-t border-db-gray-100 pt-5">
          <CoordinatorFields
            label="Alternate Emergency Coordinator"
            prefix="alternate"
            data={form.alternate}
            onChange={(field, value) => updateCoord('alternate', field, value)}
          />
        </div>

        <div className="border-t border-db-gray-100 pt-5">
          <label className="block text-sm font-semibold text-db-black mb-1.5">
            Special Needs / Mobility Issues on Floor <span className="text-db-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.specialNeeds}
            onChange={e => setForm(p => ({ ...p, specialNeeds: e.target.value }))}
            className="db-textarea"
            rows={3}
            placeholder="List individuals who may require assistance during an evacuation, including their detailed work location (e.g. 4th floor, 1st office behind reception)…"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircleIcon size={15} className="text-db-red flex-shrink-0" />
            <p className="text-xs text-db-red">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/forms" className="btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className={cn('btn-teal flex-1', loading && 'opacity-70')}>
            {loading ? 'Submitting…' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  )
}
