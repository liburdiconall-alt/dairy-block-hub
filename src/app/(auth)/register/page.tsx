'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'Something went wrong'); return }
    setSuccess(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="w-16 h-16 rounded-full bg-db-mint flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-db-teal" />
        </div>
        <h2 className="font-display text-2xl font-bold text-db-black mb-2">Access requested!</h2>
        <p className="text-db-gray-400 text-sm">Your account is pending approval. We'll email you when you're activated.</p>
        <p className="text-db-gray-300 text-xs mt-4">Redirecting to login…</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="lg:hidden mb-8">
        <span className="section-label text-db-teal text-xs">Dairy Block</span>
        <p className="font-display text-db-black text-2xl font-bold mt-0.5">Request Hub</p>
      </div>

      <h1 className="font-display text-3xl font-bold text-db-black mb-1">Request access.</h1>
      <p className="text-db-gray-400 text-sm mb-8">Create a tenant account for the hub.</p>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6">
          <AlertCircle size={16} className="text-db-red flex-shrink-0 mt-0.5" />
          <p className="text-sm text-db-red">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Full name</label>
            <input {...register('name')} className={cn('db-input', errors.name && 'border-db-red')} placeholder="Alex Moreno" />
            {errors.name && <p className="mt-1 text-xs text-db-red">{errors.name.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Email</label>
            <input {...register('email')} type="email" className={cn('db-input', errors.email && 'border-db-red')} placeholder="you@company.com" />
            {errors.email && <p className="mt-1 text-xs text-db-red">{errors.email.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Password</label>
            <input {...register('password')} type="password" className={cn('db-input', errors.password && 'border-db-red')} placeholder="Min. 8 chars, 1 uppercase, 1 number" />
            {errors.password && <p className="mt-1 text-xs text-db-red">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Suite / Unit</label>
            <input {...register('unit')} className="db-input" placeholder="4B" />
          </div>
          <div>
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Building</label>
            <input {...register('building')} className="db-input" placeholder="West Wing" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Company (optional)</label>
            <input {...register('company')} className="db-input" placeholder="Your company name" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Phone (optional)</label>
            <input {...register('phone')} className="db-input" placeholder="(720) 555-0100" />
          </div>
        </div>

        <button type="submit" disabled={loading} className={cn('btn-primary w-full py-3 text-base mt-2', loading && 'opacity-70')}>
          {loading ? 'Submitting…' : <><UserPlus size={16} /> Request Access</>}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-db-gray-100">
        <p className="text-sm text-db-gray-400 text-center">
          Already have access?{' '}
          <Link href="/login" className="text-db-teal font-medium hover:text-db-teal-dark">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
