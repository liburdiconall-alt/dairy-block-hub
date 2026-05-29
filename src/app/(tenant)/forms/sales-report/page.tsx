'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  businessName: string
  suite: string
  reportingMonth: string
  grossSales: string
  netSales: string
  numTransactions: string
  notes: string
}

export default function SalesReportForm() {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const defaultMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`

  const [form, setForm] = useState<FormData>({
    businessName: '',
    suite: '',
    reportingMonth: defaultMonth,
    grossSales: '',
    netSales: '',
    numTransactions: '',
    notes: '',
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const grossNum = parseFloat(form.grossSales.replace(/,/g, '')) || 0
  const improvementFee = (grossNum * 0.02).toFixed(2)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sales-report', formData: { ...form, improvementFee } }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `SR-${Date.now().toString(36).toUpperCase()}`)
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
          <div className="w-16 h-16 rounded-full bg-db-mint-light flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-db-teal" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Report Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your monthly sales report has been submitted to Property Management. Please ensure you include a copy of your financial statement as well.</p>
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
            <BarChart2 size={18} className="text-db-teal" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Monthly Sales Report</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">For retail tenants. Due by the 5th of each month.</p>
      </div>

      <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
        <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 space-y-0.5">
          <p className="font-semibold">Monthly sales reports are due by the 5th of each month.</p>
          <p>A copy of your financial statement must be included when submitting. The 2% improvement fee is calculated based on gross sales.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-db-black mb-1.5">Company / Business Name</label>
            <input required value={form.businessName} onChange={e => update('businessName', e.target.value)} className="db-input" placeholder="Your business name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Suite Number</label>
            <input required value={form.suite} onChange={e => update('suite', e.target.value)} className="db-input" placeholder="e.g. Suite 101" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Reporting Month</label>
            <input
              required
              type="month"
              value={form.reportingMonth}
              onChange={e => update('reportingMonth', e.target.value)}
              className="db-input"
            />
          </div>
        </div>

        <div className="border-t border-db-gray-100 pt-5 space-y-4">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider">Sales Figures</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Gross Sales ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-db-gray-400 text-sm">$</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.grossSales}
                  onChange={e => update('grossSales', e.target.value)}
                  className="db-input pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Net Sales ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-db-gray-400 text-sm">$</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.netSales}
                  onChange={e => update('netSales', e.target.value)}
                  className="db-input pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Number of Transactions</label>
            <input
              required
              type="number"
              min="0"
              value={form.numTransactions}
              onChange={e => update('numTransactions', e.target.value)}
              className="db-input"
              placeholder="Total number of transactions for the month"
            />
          </div>

          {grossNum > 0 && (
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <p className="text-xs text-amber-600 font-semibold">2% Improvement Fee</p>
                <p className="text-xs text-amber-500">Based on gross sales of ${grossNum.toLocaleString()}</p>
              </div>
              <p className="text-xl font-bold text-amber-700">${improvementFee}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Notes / Comments <span className="text-db-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            className="db-textarea"
            rows={3}
            placeholder="Any notes about this reporting period…"
          />
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
            {loading ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
