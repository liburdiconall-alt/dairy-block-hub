'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Key, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const KEY_CARD_TYPES = [
  { value: 'Replace lost/damaged Access Card', label: 'Replace lost/damaged Access Card' },
  { value: 'New Access Card',                  label: 'New Access Card'                  },
  { value: 'Building Key',                     label: 'Building Key'                     },
  { value: 'Suite Key',                        label: 'Suite Key'                        },
  { value: 'Program existing Access Card',     label: 'Program existing Access Card'     },
  { value: 'Deactivate Access Card',           label: 'Deactivate Access Card'           },
]

const COMPANY_TYPES = [
  'Property Mgmt',
  'Janitorial',
  'Security',
  'Contractor',
  'Leasing',
  'Building Tenant',
  'Bike Storage Access',
  'Fitness Center Access',
]

const FITNESS_ROOMS = [
  { value: "Ladies Locker Room", label: "Ladies Locker Room" },
  { value: "Mens Locker Room",   label: "Mens Locker Room"   },
]

interface FormData {
  company: string
  firstName: string
  lastName: string
  phone: string
  email: string
  keyQtyCardNumber: string
  authorizedBy: string
  activationDateTime: string
  deactivationDateTime: string
  keyCardTypes: string[]
  companyType: string
  fitnessRooms: string[]
  areasDescription: string
  agreeConditions: boolean
  signature: string
  signatureDate: string
}

export default function KeyRequestForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<FormData>({
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    keyQtyCardNumber: '',
    authorizedBy: '',
    activationDateTime: '',
    deactivationDateTime: '',
    keyCardTypes: [],
    companyType: '',
    fitnessRooms: [],
    areasDescription: '',
    agreeConditions: false,
    signature: '',
    signatureDate: today,
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleMulti(field: 'keyCardTypes' | 'fitnessRooms', value: string) {
    setForm(prev => {
      const arr = prev[field] as string[]
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.keyCardTypes.length === 0) {
      setError('Please select at least one key/card type.')
      return
    }
    if (!form.companyType) {
      setError('Please select a company type.')
      return
    }
    if (!form.agreeConditions) {
      setError('You must agree to the conditions before submitting.')
      return
    }
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

  const showFitnessRooms = form.companyType === 'Fitness Center Access'

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

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Key Holder Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Company</label>
            <input required value={form.company} onChange={e => update('company', e.target.value)} className="db-input" placeholder="Company name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Key Holder First Name</label>
              <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} className="db-input" placeholder="First name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Key Holder Last Name</label>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Key Qty / Card #</label>
              <input required value={form.keyQtyCardNumber} onChange={e => update('keyQtyCardNumber', e.target.value)} className="db-input" placeholder="e.g. 2 or Card #12345" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Authorized By</label>
              <input required value={form.authorizedBy} onChange={e => update('authorizedBy', e.target.value)} className="db-input" placeholder="Authorizing person" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Card Activation Date / Time</label>
              <input required type="datetime-local" value={form.activationDateTime} onChange={e => update('activationDateTime', e.target.value)} className="db-input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">
                Card De-activation Date / Time <span className="text-db-gray-400 font-normal">(optional)</span>
              </label>
              <input type="datetime-local" value={form.deactivationDateTime} onChange={e => update('deactivationDateTime', e.target.value)} className="db-input" />
            </div>
          </div>
        </div>

        {/* Areas where access will be granted */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Describe areas where access will be granted</label>
          <input required value={form.areasDescription} onChange={e => update('areasDescription', e.target.value)} className="db-input" placeholder="e.g. Suite 400, Fitness Center, Bike Storage" />
        </div>

        {/* Key / Card Type */}
        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Key / Card Type <span className="text-db-gray-300 font-normal normal-case">(select all that apply)</span></p>
          <div className="space-y-2">
            {KEY_CARD_TYPES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.keyCardTypes.includes(value)}
                  onChange={() => toggleMulti('keyCardTypes', value)}
                  className="rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
                />
                <span className="text-sm text-db-black">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company Type */}
        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Company Type <span className="text-db-gray-300 font-normal normal-case">(select one)</span></p>
          <div className="space-y-2">
            {COMPANY_TYPES.map(type => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="companyType"
                  value={type}
                  checked={form.companyType === type}
                  onChange={() => update('companyType', type)}
                  className="text-db-teal focus:ring-db-teal"
                />
                <span className="text-sm text-db-black">{type}</span>
              </label>
            ))}
          </div>

          {showFitnessRooms && (
            <div className="mt-3 ml-6 space-y-2">
              <p className="text-xs text-db-gray-400 mb-1">Select locker room access:</p>
              {FITNESS_ROOMS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fitnessRooms.includes(value)}
                    onChange={() => toggleMulti('fitnessRooms', value)}
                    className="rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
                  />
                  <span className="text-sm text-db-black">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Conditions</p>
          <div className="p-4 bg-db-gray-50 rounded-xl text-xs text-db-gray-600 leading-relaxed mb-3">
            <ol className="list-decimal ml-4 space-y-1.5">
              <li>I acknowledge assignment of the key(s) identified.</li>
              <li>I will supervise the use of the key(s) at all times.</li>
              <li>I will not duplicate any of the key(s) that are issued to me.</li>
              <li>I will notify the Property Management office immediately at pm@dairyblock.com in the event a key(s) is lost. Costs to rekey will be billed back to key holder.</li>
              <li>I will return all key(s) after assignment is complete. Keys are to be returned to the Property Mgmt. office ONLY!</li>
              <li>I acknowledge that I may be liable for any damages that are incurred as a result of my misuse of the key(s) that have been issued to me, which may include the cost of re-keying the building(s) affected.</li>
              <li>If you wish to check out additional keys please contact Property Management at pm@dairyblock.com.</li>
              <li>Secure the building behind you as you enter or leave the building.</li>
              <li>Report any damage or maintenance concerns to the Property Management office at pm@dairyblock.com.</li>
            </ol>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeConditions}
              onChange={e => update('agreeConditions', e.target.checked)}
              className="mt-0.5 rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
            />
            <span className="text-sm text-db-gray-600">I have read and agree to the above conditions.</span>
          </label>
        </div>

        {/* Signature */}
        <div className="border-t border-db-gray-100 pt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Key / Card Holder Signature</label>
            <input
              required
              value={form.signature}
              onChange={e => update('signature', e.target.value)}
              className="db-input"
              placeholder="Type your full legal name as your electronic signature"
            />
            <p className="text-xs text-db-gray-400 mt-1">By typing your name, you consent to this serving as your electronic signature.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Date</label>
            <input type="date" value={form.signatureDate} onChange={e => update('signatureDate', e.target.value)} className="db-input" />
          </div>
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
