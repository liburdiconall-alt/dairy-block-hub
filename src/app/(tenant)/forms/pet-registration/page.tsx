'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, PawPrint, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  company: string
  firstName: string
  lastName: string
  phone: string
  email: string
  petName: string
  breedDescription: string
  agreePetPolicy: boolean
  signature: string
  signatureDate: string
}

export default function PetRegistrationForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<FormData>({
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    petName: '',
    breedDescription: '',
    agreePetPolicy: false,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.agreePetPolicy) {
      setError('You must agree to the Pet Policy & Release before submitting.')
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
          <p className="text-db-gray-500 text-sm">Your pet registration has been submitted to Property Management for review. You will receive written approval or denial by email before bringing your pet on-site.</p>
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

      {/* Pet Policy & Release */}
      <div className="db-card p-5 mb-6 space-y-4">
        <h2 className="font-display text-base font-bold text-db-black">Dairy Block Pet Policy &amp; Release</h2>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          A pet may be allowed in the office if its health and behavior are acceptable within an office setting, and if it does not adversely affect the operations of the Dairy Block project. A pet owner wishing to bring a pet to the office should first obtain written permission from the management of Dairy Block. Any decision to allow a pet to come to the center, or to exclude a pet from the center, will be made by the center&apos;s management. That decision will be final.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          An employee who requires the help of a service animal (defined by 28 CFR 36.104 as &ldquo;any dog that is individually trained to do work or perform tasks for the benefit of an individual with a disability&rdquo;) will be permitted to bring a service animal to Dairy Block, provided that the animal&apos;s presence does not create a danger to others and does not impose an undue hardship upon the company.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          Pets are not allowed inside food and beverage establishments except in outdoor patio seating areas only, and at the discretion of the restaurant or store manager.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          In all cases the privilege of bringing a pet to work is subordinate to the health, safety, and comfort of persons who may come into contact with animals at the site. An animal may be excluded from Dairy Block if it:
        </p>
        <ul className="text-sm text-db-gray-600 space-y-1 ml-4 list-disc">
          <li>causes any person to experience allergic reactions, fear, or any other physical or psychological discomfort;</li>
          <li>distracts from the operation and ambiance of Dairy Block.</li>
        </ul>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          Any individual with a grievance regarding an animal at Dairy Block should bring the matter to the attention of the management of the Dairy Block. In addition, the following animals may not be brought to the workplace:
        </p>
        <ul className="text-sm text-db-gray-600 space-y-1 ml-4 list-disc">
          <li>sick animals;</li>
          <li>animals with fleas or any disease that is communicable to other animals at the site or to humans;</li>
          <li>animals that have not been properly vaccinated, or that have internal or external parasites;</li>
          <li>dogs that bark or behave aggressively; or</li>
          <li>animals that foul the inside or outside of the building.</li>
        </ul>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          Animals that have not been spayed or neutered will not be permitted to come to the office. All dogs must be leashed at all times. A photo and immunization record must be provided before the animal is allowed on the premises. All animals must be in the continuous full control of their owners. They should be in the physical presence of the owner, in the owner&apos;s office, at all times. Owners are expected to clean up, completely and immediately, after their animals.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          An employee who brings an animal to the office as well as the company the employee works for is completely and solely liable for any injuries or any damage to personal property caused by the animal. Any repair or cleaning/maintenance costs incurred by an animal will be charged and billed accordingly.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          The ownership of Dairy Block may, at its discretion, require animal owner to maintain a liability insurance policy covering damage or injuries caused by the animal while at the site. The company may specify minimum coverage amounts under such a policy, and may require the owner to pay for such coverage.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          Dairy Block ownership shall not be liable for loss of, or injury to, any animal brought to the office.
        </p>

        <p className="text-sm text-db-gray-600 leading-relaxed">
          Pet owner agrees any violation of the foregoing Waiver and its terms and conditions, as determined by Landlord, Property Manager or Facility Manager, shall void and terminate User&apos;s right to bring the pet on the premises in accordance with this Waiver. This Waiver shall be governed by the laws of the state of Colorado. The pet owner intending to be legally bound has caused this Waiver to be executed on the date referenced below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Tenant Company</label>
          <input required value={form.company} onChange={e => update('company', e.target.value)} className="db-input" placeholder="Company name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Employee First Name</label>
            <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} className="db-input" placeholder="First name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Employee Last Name</label>
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

        <div className="border-t border-db-gray-100 pt-5">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-4">Pet Information</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Pet Name</label>
              <input required value={form.petName} onChange={e => update('petName', e.target.value)} className="db-input" placeholder="Pet name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Breed &amp; Description</label>
              <input required value={form.breedDescription} onChange={e => update('breedDescription', e.target.value)} className="db-input" placeholder="e.g. Golden Retriever, medium size, golden coat" />
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
            <span className="text-sm text-db-gray-600">I have read and agree to the Dairy Block Pet Policy &amp; Release above.</span>
          </label>
        </div>

        <div className="border-t border-db-gray-100 pt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Name</label>
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
            {loading ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  )
}
