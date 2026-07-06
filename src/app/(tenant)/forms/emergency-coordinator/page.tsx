'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle as AlertCircleIcon, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoordinatorInfo {
  name: string
  title: string
  mobilePhone: string
  officePhone: string
  email: string
}

interface MobilityPerson {
  name: string
  location: string
}

interface FormData {
  companyName: string
  primary: [CoordinatorInfo, CoordinatorInfo]
  alternate: [CoordinatorInfo, CoordinatorInfo]
  mobilityPersons: [MobilityPerson, MobilityPerson]
  completedBy: string
  signatureDate: string
}

function CoordinatorFields({ label, data, onChange }: {
  label: string
  data: CoordinatorInfo
  onChange: (field: keyof CoordinatorInfo, value: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Name</label>
          <input value={data.name} onChange={e => onChange('name', e.target.value)} className="db-input" placeholder="Full name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Title / Position</label>
          <input value={data.title} onChange={e => onChange('title', e.target.value)} className="db-input" placeholder="Job title" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Mobile Phone</label>
          <input type="tel" value={data.mobilePhone} onChange={e => onChange('mobilePhone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Office Phone</label>
          <input type="tel" value={data.officePhone} onChange={e => onChange('officePhone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-db-black mb-1.5">Email</label>
          <input type="email" value={data.email} onChange={e => onChange('email', e.target.value)} className="db-input" placeholder="email@company.com" />
        </div>
      </div>
    </div>
  )
}

const emptyCoord = (): CoordinatorInfo => ({ name: '', title: '', mobilePhone: '', officePhone: '', email: '' })
const emptyMobility = (): MobilityPerson => ({ name: '', location: '' })

export default function EmergencyCoordinatorForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<FormData>({
    companyName: '',
    primary: [emptyCoord(), emptyCoord()],
    alternate: [emptyCoord(), emptyCoord()],
    mobilityPersons: [emptyMobility(), emptyMobility()],
    completedBy: '',
    signatureDate: today,
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function updateCoord(which: 'primary' | 'alternate', index: 0 | 1, field: keyof CoordinatorInfo, value: string) {
    setForm(prev => {
      const updated = [...prev[which]] as [CoordinatorInfo, CoordinatorInfo]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, [which]: updated }
    })
  }

  function updateMobility(index: 0 | 1, field: keyof MobilityPerson, value: string) {
    setForm(prev => {
      const updated = [...prev.mobilityPersons] as [MobilityPerson, MobilityPerson]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, mobilityPersons: updated }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.primary[0].name) {
      setError('At least one Primary Emergency Coordinator name is required.')
      return
    }
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
          <h1 className="font-display text-2xl font-bold text-db-black">Emergency Coordinator Information Form</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Designate emergency coordinators for your floor. Required within one week of move-in.</p>
      </div>

      <div className="flex items-start gap-2 p-4 bg-db-mint-light rounded-xl mb-3">
        <Info size={15} className="text-db-teal flex-shrink-0 mt-0.5" />
        <p className="text-xs text-db-teal-dark">Designate one Emergency Coordinator per every 20 on-site staff members. The alternate coordinator steps in if the primary is absent during an emergency or evacuation.</p>
      </div>
      <div className="mb-6">
        <a
          href="/docs/emergency-coordinator-handbook.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-db-teal hover:text-db-teal-dark transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View Emergency Coordinator Handbook (PDF)
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Company Name</label>
          <input required value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} className="db-input" placeholder="Your company name" />
        </div>

        {/* Primary coordinators */}
        <div className="border-t border-db-gray-100 pt-5 space-y-6">
          <CoordinatorFields
            label="Primary Emergency Coordinator #1"
            data={form.primary[0]}
            onChange={(field, value) => updateCoord('primary', 0, field, value)}
          />
          <CoordinatorFields
            label="Primary Emergency Coordinator #2"
            data={form.primary[1]}
            onChange={(field, value) => updateCoord('primary', 1, field, value)}
          />
        </div>

        {/* Alternate coordinators */}
        <div className="border-t border-db-gray-100 pt-5 space-y-6">
          <CoordinatorFields
            label="Alternate Emergency Coordinator #1"
            data={form.alternate[0]}
            onChange={(field, value) => updateCoord('alternate', 0, field, value)}
          />
          <CoordinatorFields
            label="Alternate Emergency Coordinator #2"
            data={form.alternate[1]}
            onChange={(field, value) => updateCoord('alternate', 1, field, value)}
          />
        </div>

        {/* Mobility impaired */}
        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-sm font-semibold text-db-black mb-4">
            MOBILITY IMPAIRED INDIVIDUALS – Those requiring assistance down the stairs during an evacuation
          </p>
          {([0, 1] as const).map(i => (
            <div key={i} className="space-y-3 mb-5">
              <p className="text-xs text-db-gray-400 font-medium">Person {i + 1}</p>
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Name</label>
                <input
                  value={form.mobilityPersons[i].name}
                  onChange={e => updateMobility(i, 'name', e.target.value)}
                  className="db-input"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Detailed work location</label>
                <input
                  value={form.mobilityPersons[i].location}
                  onChange={e => updateMobility(i, 'location', e.target.value)}
                  className="db-input"
                  placeholder="e.g. 2nd floor – 1st office behind reception desk"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Completed by / Signature */}
        <div className="border-t border-db-gray-100 pt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Completed By / Signature</label>
            <input
              required
              value={form.completedBy}
              onChange={e => setForm(p => ({ ...p, completedBy: e.target.value }))}
              className="db-input"
              placeholder="Type your full legal name as your electronic signature"
            />
            <p className="text-xs text-db-gray-400 mt-1">By typing your name, you consent to this serving as your electronic signature.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Date</label>
            <input type="date" value={form.signatureDate} onChange={e => setForm(p => ({ ...p, signatureDate: e.target.value }))} className="db-input" />
          </div>
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
