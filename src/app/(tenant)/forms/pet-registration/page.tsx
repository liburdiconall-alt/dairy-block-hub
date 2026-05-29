'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, PawPrint, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  tenantName: string
  suite: string
  petName: string
  species: string
  speciesOther: string
  breed: string
  colorMarkings: string
  weight: string
  vetName: string
  vetPhone: string
  vaccinated: string
  agreePetPolicy: boolean
}

export default function PetRegistrationForm() {
  const [form, setForm] = useState<FormData>({
    tenantName: '',
    suite: '',
    petName: '',
    species: 'Dog',
    speciesOther: '',
    breed: '',
    colorMarkings: '',
    weight: '',
    vetName: '',
    vetPhone: '',
    vaccinated: 'Yes',
    agreePetPolicy: false,
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
    if (!form.agreePetPolicy) {
      setError('You must agree to the Pet Policy before submitting.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pet-registration', formData: form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `PR-${Date.now().toString(36).toUpperCase()}`)
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
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-amber-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Registration Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your pet registration request has been submitted. Property Management will review and respond with written approval before your pet may be brought on-site.</p>
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
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <PawPrint size={18} className="text-amber-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Pet Registration</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Written approval from Property Management is required before bringing any pet on-site.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Tenant Name</label>
            <input required value={form.tenantName} onChange={e => update('tenantName', e.target.value)} className="db-input" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Unit / Suite Number</label>
            <input required value={form.suite} onChange={e => update('suite', e.target.value)} className="db-input" placeholder="e.g. Suite 400" />
          </div>
        </div>

        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-4">Pet Information</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Pet Name</label>
                <input required value={form.petName} onChange={e => update('petName', e.target.value)} className="db-input" placeholder="Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Species</label>
                <select required value={form.species} onChange={e => update('species', e.target.value)} className="db-input">
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {form.species === 'Other' && (
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Specify Species</label>
                <input required value={form.speciesOther} onChange={e => update('speciesOther', e.target.value)} className="db-input" placeholder="e.g. Rabbit, Bird…" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Breed</label>
                <input required value={form.breed} onChange={e => update('breed', e.target.value)} className="db-input" placeholder="Breed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-db-black mb-1.5">Weight (lbs)</label>
                <input required type="number" min="0" value={form.weight} onChange={e => update('weight', e.target.value)} className="db-input" placeholder="e.g. 25" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Color / Markings</label>
              <input required value={form.colorMarkings} onChange={e => update('colorMarkings', e.target.value)} className="db-input" placeholder="e.g. Black and white, brown spots…" />
            </div>
          </div>
        </div>

        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-4">Veterinarian Information</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Veterinarian Name</label>
              <input required value={form.vetName} onChange={e => update('vetName', e.target.value)} className="db-input" placeholder="Vet name or clinic" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Veterinarian Phone</label>
              <input required type="tel" value={form.vetPhone} onChange={e => update('vetPhone', e.target.value)} className="db-input" placeholder="(303) 555-0000" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-db-black mb-1.5">Are vaccinations up to date?</label>
            <div className="flex gap-4">
              {['Yes', 'No'].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vaccinated"
                    value={v}
                    checked={form.vaccinated === v}
                    onChange={() => update('vaccinated', v)}
                    className="text-db-teal focus:ring-db-teal"
                  />
                  <span className="text-sm text-db-black">{v}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-db-gray-50 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreePetPolicy}
              onChange={e => update('agreePetPolicy', e.target.checked)}
              className="mt-0.5 rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
            />
            <span className="text-sm text-db-gray-600">I agree to the Dairy Block Pet Policy, including keeping my pet leashed at all times, cleaning up after my pet immediately, and accepting full liability for any injuries or damage caused by my pet.</span>
          </label>
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
            {loading ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  )
}
