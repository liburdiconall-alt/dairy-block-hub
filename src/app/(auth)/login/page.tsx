'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [showPw, setShowPw] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setAuthError('')
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setLoading(false)

    if (res?.error) {
      setAuthError('Invalid email or password. Please try again.')
      return
    }

    // Redirect based on role is handled by middleware
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      {/* Logo mark (mobile) */}
      <div className="lg:hidden mb-8">
        <span className="section-label text-db-teal text-xs">Dairy Block</span>
        <p className="font-display text-db-black text-2xl font-bold mt-0.5">Maintenance & Security Hub</p>
      </div>

      <h1 className="font-display text-3xl font-bold text-db-black mb-1">Welcome back.</h1>
      <p className="text-db-gray-400 text-sm mb-8">Sign in to access your portal.</p>

      {authError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6">
          <AlertCircle size={16} className="text-db-red flex-shrink-0 mt-0.5" />
          <p className="text-sm text-db-red">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-db-gray-700 mb-1.5">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@dairyblock.com"
            className={cn('db-input', errors.email && 'border-db-red focus:ring-red-200 focus:border-db-red')}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-db-red">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-db-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-db-teal hover:text-db-teal-dark">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn('db-input pr-10', errors.password && 'border-db-red focus:ring-red-200 focus:border-db-red')}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-db-gray-400 hover:text-db-gray-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-db-red">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'btn-primary w-full py-3 text-base',
            loading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              Sign In <LogIn size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-db-gray-100">
        <p className="text-sm text-db-gray-400 text-center">
          New to the hub?{' '}
          <Link href="/register" className="text-db-teal font-medium hover:text-db-teal-dark">
            Request access
          </Link>
        </p>
      </div>

      {/* Dev credentials hint */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-db-gray-50 rounded-xl border border-db-gray-200 text-xs text-db-gray-400 space-y-1">
          <p className="font-semibold text-db-gray-600 mb-2">Dev credentials</p>
          <p>Tenant: tenant@dairyblock.com / tenant123!</p>
          <p>Admin: admin@dairyblock.com / admin123!</p>
          <p>Manager: manager@dairyblock.com / manager123!</p>
          <p>Tech: tech@dairyblock.com / tech123!</p>
          <p>Security: security@dairyblock.com / security123!</p>
        </div>
      )}
    </div>
  )
}
