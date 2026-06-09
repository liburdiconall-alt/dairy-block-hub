'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserCog, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { staffRegisterSchema, type StaffRegisterInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function StaffRegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<StaffRegisterInput>({
    resolver: zodResolver(staffRegisterSchema),
  })

  async function onSubmit(data: StaffRegisterInput) {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register-staff', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'Something went wrong'); return }
    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="w-16 h-16 rounded-full bg-db-mint flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-db-teal" />
        </div>
        <h2 className="font-display text-2xl font-bold text-db-black mb-2">Request submitted!</h2>
        <p className="text-db-gray-400 text-sm max-w-xs mx-auto">
          Your staff account request is pending administrator approval. You'll receive an email once your account has been reviewed.
        </p>
        <p className="text-db-gray-300 text-xs mt-4">Redirecting to login…</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="lg:hidden mb-8">
        <span className="section-label text-db-teal text-xs">Dairy Block</span>
        <p className="font-display text-db-black text-2xl font-bold mt-0.5">Staff Hub</p>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h1 className="font-display text-3xl font-bold text-db-black">Staff access request.</h1>
      </div>
      <p className="text-db-gray-400 text-sm mb-8">Request a staff account for the Dairy Block Hub.</p>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-db-mint-light border border-db-mint mb-6">
        <ShieldCheck size={16} className="text-db-teal flex-shrink-0 mt-0.5" />
        <p className="text-sm text-db-teal">
          Staff accounts require administrator approval before you can log in. Admins will be notified of your request.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6">
          <AlertCircle size={16} className="text-db-red flex-shrink-0 mt-0.5" />
          <p className="text-sm text-db-red">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Full name</label>
          <input
            {...register('name')}
            className={cn('db-input', errors.name && 'border-db-red')}
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-1 text-xs text-db-red">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Work email</label>
          <input
            {...register('email')}
            type="email"
            className={cn('db-input', errors.email && 'border-db-red')}
            placeholder="you@realberry.com"
          />
          {errors.email && <p className="mt-1 text-xs text-db-red">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Password</label>
          <input
            {...register('password')}
            type="password"
            className={cn('db-input', errors.password && 'border-db-red')}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
          />
          {errors.password && <p className="mt-1 text-xs text-db-red">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-db-gray-700 mb-1.5">Account type</label>
          <select
            {...register('role')}
            className={cn('db-input', errors.role && 'border-db-red')}
            defaultValue=""
          >
            <option value="" disabled>Select account type…</option>
            <option value="PROPERTY_MANAGER">Property Manager — access to tenant submissions, events, and content</option>
            <option value="ADMIN">Administrator — full access including staff account approvals</option>
          </select>
          {errors.role && <p className="mt-1 text-xs text-db-red">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn('btn-primary w-full py-3 text-base mt-2', loading && 'opacity-70')}
        >
          {loading ? 'Submitting…' : <><UserCog size={16} /> Request Staff Access</>}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-db-gray-100 space-y-3">
        <p className="text-sm text-db-gray-400 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-db-teal font-medium hover:text-db-teal-dark">Sign in</Link>
        </p>
        <p className="text-sm text-db-gray-400 text-center">
          Looking for tenant access?{' '}
          <Link href="/register" className="text-db-teal font-medium hover:text-db-teal-dark">Tenant registration</Link>
        </p>
      </div>
    </div>
  )
}
