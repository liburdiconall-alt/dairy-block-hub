'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wrench, Shield, AlertTriangle, Info, Upload, X, ArrowLeft, Send } from 'lucide-react'
import { newRequestSchema, type NewRequestInput } from '@/lib/validations'
import { MAINTENANCE_CATEGORIES, SECURITY_CATEGORIES, cn } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

const URGENCY_OPTIONS = [
  { value: 'LOW',       label: 'Low',       desc: '3–5 business days',  color: 'border-db-gray-200 hover:border-db-gray-400' },
  { value: 'MEDIUM',    label: 'Medium',    desc: 'Within 24 hours',    color: 'border-db-gray-200 hover:border-amber-300'   },
  { value: 'HIGH',      label: 'High',      desc: 'Within 4 hours',     color: 'border-db-gray-200 hover:border-db-orange'   },
  { value: 'EMERGENCY', label: 'Emergency', desc: 'Within 1 hour',      color: 'border-db-gray-200 hover:border-db-red'      },
] as const

export default function NewRequestPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const defaultType  = searchParams.get('type') === 'security' ? 'SECURITY' : 'MAINTENANCE'

  const [requestType, setRequestType] = useState<'MAINTENANCE' | 'SECURITY'>(defaultType as any)
  const [files, setFiles]             = useState<File[]>([])
  const [loading, setLoading]         = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NewRequestInput>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: { type: defaultType as any, urgency: 'MEDIUM' },
  })

  const urgency = watch('urgency')

  async function onSubmit(data: NewRequestInput) {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries({ ...data, type: requestType }).forEach(([k, v]) => {
        if (v !== undefined && v !== '') formData.append(k, String(v))
      })
      files.forEach(f => formData.append('files', f))

      const res = await fetch('/api/requests', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Failed to submit')

      toast.success('Request submitted! Check your email for confirmation.')
      router.push(`/requests/${json.ticketNumber}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = requestType === 'MAINTENANCE' ? MAINTENANCE_CATEGORIES : SECURITY_CATEGORIES

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">

      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-2">New Request</p>
        <h1 className="font-display text-3xl font-bold text-db-black">What can we help with?</h1>
        <p className="text-db-gray-400 mt-1">Fill out the form below and we'll get right on it.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Type selector */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-3">Request type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'MAINTENANCE', label: 'Maintenance', icon: Wrench, desc: 'Repairs, HVAC, electrical, plumbing', color: 'peer-checked:border-db-teal peer-checked:bg-db-mint-light' },
              { value: 'SECURITY',    label: 'Security',    icon: Shield,  desc: 'Access, incidents, safety',          color: 'peer-checked:border-db-orange peer-checked:bg-orange-50'  },
            ].map(({ value, label, icon: Icon, desc, color }) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  className="peer sr-only"
                  checked={requestType === value}
                  onChange={() => { setRequestType(value as any); setValue('type', value as any) }}
                />
                <div className={cn(
                  'border-2 rounded-2xl p-4 transition-all duration-150',
                  color,
                  requestType === value ? (value === 'MAINTENANCE' ? 'border-db-teal bg-db-mint-light' : 'border-db-orange bg-orange-50') : 'border-db-gray-200 bg-white'
                )}>
                  <Icon size={20} className={requestType === value ? (value === 'MAINTENANCE' ? 'text-db-teal' : 'text-db-orange') : 'text-db-gray-400'} />
                  <p className="font-semibold text-db-black text-sm mt-2">{label}</p>
                  <p className="text-xs text-db-gray-400 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Category</label>
          <select
            {...register('category')}
            className={cn('db-input', errors.category && 'border-db-red')}
          >
            <option value="">Select a category…</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-db-red">{errors.category.message}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Title</label>
          <input
            {...register('title')}
            className={cn('db-input', errors.title && 'border-db-red')}
            placeholder="Brief summary of the issue…"
          />
          {errors.title && <p className="mt-1 text-xs text-db-red">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Description</label>
          <textarea
            {...register('description')}
            className={cn('db-textarea', errors.description && 'border-db-red')}
            rows={4}
            placeholder="Describe the issue in detail — what you're experiencing, when it started, how severe it is…"
          />
          {errors.description && <p className="mt-1 text-xs text-db-red">{errors.description.message}</p>}
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-db-black mb-1.5">Location</label>
            <input
              {...register('location')}
              className={cn('db-input', errors.location && 'border-db-red')}
              placeholder="Suite 4B, hallway, lobby…"
            />
            {errors.location && <p className="mt-1 text-xs text-db-red">{errors.location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Floor (optional)</label>
            <input {...register('floor')} className="db-input" placeholder="4" />
          </div>
        </div>

        {/* Security-specific fields */}
        {requestType === 'SECURITY' && (
          <div className="space-y-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <p className="text-xs font-semibold text-db-orange uppercase tracking-wider">Security Details (optional)</p>
            <div>
              <label className="block text-sm font-medium text-db-black mb-1.5">Date/Time of Incident</label>
              <input {...register('incidentDate')} type="datetime-local" className="db-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-db-black mb-1.5">Persons Involved</label>
              <textarea {...register('personsInvolved')} className="db-textarea" rows={2} placeholder="Names, descriptions…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-db-black mb-1.5">Witnesses</label>
              <textarea {...register('witnesses')} className="db-textarea" rows={2} placeholder="Witness names or contact info…" />
            </div>
          </div>
        )}

        {/* Urgency */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-3">Urgency level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {URGENCY_OPTIONS.map(({ value, label, desc, color }) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" className="sr-only" value={value} {...register('urgency')} />
                <div className={cn(
                  'border-2 rounded-xl p-3 text-center transition-all duration-150 text-sm',
                  urgency === value
                    ? value === 'EMERGENCY' ? 'border-db-red bg-red-50' :
                      value === 'HIGH'      ? 'border-db-orange bg-orange-50' :
                      value === 'MEDIUM'    ? 'border-db-marigold bg-amber-50' :
                                             'border-db-teal bg-db-mint-light'
                    : `border-db-gray-200 bg-white ${color}`
                )}>
                  <p className="font-semibold text-db-black">{label}</p>
                  <p className="text-xs text-db-gray-400 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          {urgency === 'EMERGENCY' && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <AlertTriangle size={15} className="text-db-red flex-shrink-0 mt-0.5" />
              <p className="text-xs text-db-red">Emergency requests alert on-call staff immediately. Please only select this for genuine emergencies.</p>
            </div>
          )}
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Attachments (optional)</label>
          <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-db-gray-200 rounded-2xl cursor-pointer hover:border-db-teal/40 hover:bg-db-mint-light/30 transition-all">
            <Upload size={20} className="text-db-gray-300" />
            <span className="text-sm text-db-gray-400">Click to upload photos, videos, or documents</span>
            <span className="text-xs text-db-gray-300">Max 10MB per file</span>
            <input
              type="file"
              className="sr-only"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={e => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-db-gray-500 bg-db-gray-50 rounded-lg px-3 py-2">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-db-gray-400 hover:text-db-red ml-2">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3.5 bg-db-mint-light rounded-xl">
          <Info size={15} className="text-db-teal flex-shrink-0 mt-0.5" />
          <p className="text-xs text-db-teal-dark leading-relaxed">
            You'll receive email confirmation immediately after submission. Status updates will be sent as your request progresses.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard" className="btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className={cn('btn-teal flex-1', loading && 'opacity-70')}>
            {loading ? 'Submitting…' : <><Send size={16} /> Submit Request</>}
          </button>
        </div>
      </form>
    </div>
  )
}
