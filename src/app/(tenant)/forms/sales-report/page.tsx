'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart2, CheckCircle2, AlertCircle, Info, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  businessName: string
  firstName: string
  lastName: string
  phone: string
  email: string
  suite: string
  reportingMonth: string
  grossSales: string
  percentageRentRate: string
  notes: string
  supportingReportName: string
  supportingReportData: string
  certify: boolean
  authorizedSignature: string
}

export default function SalesReportForm() {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const defaultMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormData>({
    businessName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    suite: '',
    reportingMonth: defaultMonth,
    grossSales: '',
    percentageRentRate: '',
    notes: '',
    supportingReportName: '',
    supportingReportData: '',
    certify: false,
    authorizedSignature: '',
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      update('supportingReportData', ev.target?.result as string)
      update('supportingReportName', file.name)
    }
    reader.readAsDataURL(file)
  }

  const grossNum          = parseFloat(form.grossSales.replace(/,/g, '')) || 0
  const improvementFee    = grossNum * 0.02
  const pctRate           = parseFloat(form.percentageRentRate) || 0
  const percentageRentDue = grossNum * (pctRate / 100)
  const totalDue          = improvementFee + percentageRentDue

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sales-report',
          formData: {
            ...form,
            improvementFee: improvementFee.toFixed(2),
            percentageRentDue: percentageRentDue.toFixed(2),
            totalDue: totalDue.toFixed(2),
          },
        }),
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
          <p className="text-db-gray-500 text-sm">Your monthly sales report has been submitted to Property Management.</p>
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
        <p className="text-db-gray-400 text-sm ml-12">For retail tenants. Due by the 20th of the following month.</p>
      </div>

      <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
        <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 space-y-0.5">
          <p className="font-semibold">Sales report forms are due on the 20th of the following month or on the date indicated in the Lease Agreement.</p>
          <p>A copy of the Tenant&apos;s financial statement must be included with your submission. The 2% improvement fee is calculated based on gross sales.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tenant Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Tenant Company</label>
            <input required value={form.businessName} onChange={e => update('businessName', e.target.value)} className="db-input" placeholder="Your business name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">First Name</label>
              <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} className="db-input" placeholder="First name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Last Name</label>
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
              <label className="block text-sm font-semibold text-db-black mb-1.5">Suite Number</label>
              <input required value={form.suite} onChange={e => update('suite', e.target.value)} className="db-input" placeholder="e.g. Suite 101" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-db-black mb-1.5">Sales Reporting Period (month, year)</label>
              <input
                required
                type="month"
                value={form.reportingMonth}
                onChange={e => update('reportingMonth', e.target.value)}
                className="db-input"
              />
            </div>
          </div>
        </div>

        {/* Sales Figures */}
        <div className="border-t border-db-gray-100 pt-5 space-y-4">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider">Sales Figures</p>

          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Total Gross Sales ($)</label>
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
            <label className="block text-sm font-semibold text-db-black mb-1.5">
              Percentage Rent Rate (%) <span className="text-db-gray-400 font-normal">(from your lease, if applicable)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.percentageRentRate}
                onChange={e => update('percentageRentRate', e.target.value)}
                className="db-input pr-8"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-db-gray-400 text-sm">%</span>
            </div>
          </div>

          {grossNum > 0 && (
            <div className="rounded-xl border border-amber-200 overflow-hidden">
              <div className="bg-amber-50 px-4 py-2">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Fee Summary</p>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-db-gray-600">Improvement Fee Due</p>
                    <p className="text-xs text-db-gray-400">2% of ${grossNum.toLocaleString()} gross sales</p>
                  </div>
                  <p className="text-base font-semibold text-db-black">${improvementFee.toFixed(2)}</p>
                </div>
                {pctRate > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-db-gray-600">Percentage Rent Due</p>
                      <p className="text-xs text-db-gray-400">{pctRate}% of ${grossNum.toLocaleString()} gross sales</p>
                    </div>
                    <p className="text-base font-semibold text-db-black">${percentageRentDue.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                  <p className="text-sm font-bold text-db-black">Total Due for Period</p>
                  <p className="text-xl font-bold text-amber-700">${totalDue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Supporting Financial Report Upload */}
        <div className="border-t border-db-gray-100 pt-5">
          <label className="block text-sm font-semibold text-db-black mb-1.5">
            Tenant&apos;s Financial Statement <span className="text-db-gray-400 font-normal">(required)</span>
          </label>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
              form.supportingReportName
                ? 'border-db-teal bg-db-mint-light/30'
                : 'border-db-gray-200 hover:border-db-teal/50 hover:bg-db-gray-50',
            )}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload size={20} className={cn('mx-auto mb-2', form.supportingReportName ? 'text-db-teal' : 'text-db-gray-300')} />
            {form.supportingReportName ? (
              <p className="text-sm font-medium text-db-teal">{form.supportingReportName}</p>
            ) : (
              <>
                <p className="text-sm text-db-gray-500">Click to upload your Tenant&apos;s financial statement</p>
                <p className="text-xs text-db-gray-400 mt-1">PDF, Excel, CSV, or Word — max 10 MB</p>
              </>
            )}
          </div>
        </div>

        {/* Certification */}
        <div className="border-t border-db-gray-100 pt-5 space-y-4">
          <div className="p-4 bg-db-gray-50 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.certify}
                onChange={e => update('certify', e.target.checked)}
                className="mt-0.5 rounded border-db-gray-300 text-db-teal focus:ring-db-teal"
              />
              <span className="text-sm text-db-gray-600">I hereby certify that the above figures are true and correct.</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Authorized Signature</label>
            <input
              required
              value={form.authorizedSignature}
              onChange={e => update('authorizedSignature', e.target.value)}
              className="db-input"
              placeholder="Type your full legal name as your electronic signature"
            />
            <p className="text-xs text-db-gray-400 mt-1">By typing your name, you consent to this serving as your electronic signature.</p>
          </div>
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
