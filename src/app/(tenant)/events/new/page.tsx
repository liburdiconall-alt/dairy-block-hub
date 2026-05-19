'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Send, Calendar, Info } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { EVENT_TYPE_LABELS, EVENT_SPACES, cn } from '@/lib/utils'

const schema = z.object({
  title:             z.string().min(3, 'Title is required'),
  type:              z.enum(['ACTIVATION','PRIVATE_EVENT','COMMUNITY_EVENT','POP_UP','CORPORATE','OTHER']),
  description:       z.string().min(10, 'Please provide a description of at least 10 characters'),
  proposedDate:      z.string().min(1, 'Please select a date'),
  startTime:         z.string().min(1, 'Start time is required'),
  endTime:           z.string().min(1, 'End time is required'),
  location:          z.string().min(1, 'Please select a location'),
  expectedAttendees: z.coerce.number().min(1, 'Enter expected number of attendees'),
  setupNotes:        z.string().optional(),
})

type FormData = z.infer<typeof schema>

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS) as [keyof typeof EVENT_TYPE_LABELS, string][]

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to submit')
      toast.success('Proposal submitted! Check your email for confirmation.')
      router.push(`/events/${json.proposalNumber}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Events
      </Link>

      <div className="mb-8">
        <p className="section-label mb-2">New Proposal</p>
        <h1 className="font-display text-3xl font-bold text-db-black">Propose an Event</h1>
        <p className="text-db-gray-400 mt-1 text-sm">Tell us about your event or activation idea. We review all proposals and aim to respond within 3 business days.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Event title</label>
          <input
            {...register('title')}
            className={cn('db-input', errors.title && 'border-db-red')}
            placeholder="e.g. Summer Rooftop Pop-Up"
          />
          {errors.title && <p className="mt-1 text-xs text-db-red">{errors.title.message}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Event type</label>
          <select {...register('type')} className={cn('db-input', errors.type && 'border-db-red')}>
            <option value="">Select a type…</option>
            {EVENT_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-db-red">{errors.type.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Description</label>
          <textarea
            {...register('description')}
            rows={5}
            className={cn('db-textarea', errors.description && 'border-db-red')}
            placeholder="Describe your event — what it is, who it's for, what you're hoping to achieve, any specific setup or equipment needs, vendors involved, etc."
          />
          {errors.description && <p className="mt-1 text-xs text-db-red">{errors.description.message}</p>}
        </div>

        {/* Date & Times */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-3">Date & times</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs text-db-gray-500 mb-1">Proposed date</label>
              <input type="date" {...register('proposedDate')} className={cn('db-input', errors.proposedDate && 'border-db-red')} />
              {errors.proposedDate && <p className="mt-1 text-xs text-db-red">{errors.proposedDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-db-gray-500 mb-1">Start time</label>
              <input type="time" {...register('startTime')} className={cn('db-input', errors.startTime && 'border-db-red')} />
              {errors.startTime && <p className="mt-1 text-xs text-db-red">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-db-gray-500 mb-1">End time</label>
              <input type="time" {...register('endTime')} className={cn('db-input', errors.endTime && 'border-db-red')} />
              {errors.endTime && <p className="mt-1 text-xs text-db-red">{errors.endTime.message}</p>}
            </div>
          </div>
        </div>

        {/* Location & Attendees */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-db-black mb-1.5">Preferred space</label>
            <select {...register('location')} className={cn('db-input', errors.location && 'border-db-red')}>
              <option value="">Select a space…</option>
              {EVENT_SPACES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.location && <p className="mt-1 text-xs text-db-red">{errors.location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Expected attendees</label>
            <input
              type="number"
              min={1}
              {...register('expectedAttendees')}
              className={cn('db-input', errors.expectedAttendees && 'border-db-red')}
              placeholder="50"
            />
            {errors.expectedAttendees && <p className="mt-1 text-xs text-db-red">{errors.expectedAttendees.message}</p>}
          </div>
        </div>

        {/* Setup notes */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">
            Additional setup notes <span className="text-db-gray-300 font-normal">(optional)</span>
          </label>
          <textarea
            {...register('setupNotes')}
            rows={3}
            className="db-textarea"
            placeholder="Any additional requirements — AV equipment, furniture, catering access, parking, security, etc."
          />
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 p-3.5 bg-db-mint-light rounded-xl">
          <Info size={15} className="text-db-teal flex-shrink-0 mt-0.5" />
          <p className="text-xs text-db-teal-dark leading-relaxed">
            You will receive an email confirmation immediately after submitting. Our team reviews all proposals and will follow up within 3 business days.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link href="/events" className="btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className={cn('btn-teal flex-1', loading && 'opacity-70')}>
            {loading ? 'Submitting…' : <><Send size={16} /> Submit Proposal</>}
          </button>
        </div>
      </form>
    </div>
  )
}
