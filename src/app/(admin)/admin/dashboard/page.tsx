import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff Dashboard' }

const FORM_TYPE_LABELS: Record<string, string> = {
  KEY_REQUEST:              'Key / Access Card Request',
  FITNESS_WAIVER:           'Fitness Waiver',
  PET_REGISTRATION:         'Pet Registration',
  EMERGENCY_COORDINATOR:    'Emergency Coordinator',
  HANDBOOK_ACKNOWLEDGEMENT: 'Handbook Acknowledgement',
  RETAIL_SALES_REPORT:      'Monthly Sales Report',
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  IN_REVIEW: { label: 'In Review', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  COMPLETED: { label: 'Completed', className: 'bg-db-mint-light text-db-teal border border-db-teal/20' },
  DENIED:    { label: 'Denied',    className: 'bg-red-50 text-db-red border border-red-200' },
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [totalSubmissions, pendingReview, inReview, completedForms, recentSubmissions] =
    await Promise.all([
      prisma.formSubmission.count(),
      prisma.formSubmission.count({ where: { status: 'SUBMITTED' } }),
      prisma.formSubmission.count({ where: { status: 'IN_REVIEW' } }),
      prisma.formSubmission.count({ where: { status: 'COMPLETED' } }),
      prisma.formSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take:    15,
        include: { submittedBy: true },
      }),
    ])

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <p className="section-label mb-1">Staff Dashboard</p>
        <h1 className="font-display text-3xl font-bold text-db-black">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h1>
        <p className="text-db-gray-400 mt-1">
          {session?.user.name} · {session?.user.role?.replace(/_/g, ' ')}
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Submissions" value={totalSubmissions} icon={TrendingUp}   iconBg="bg-db-gray-100"   iconColor="text-db-gray-600"  />
        <StatsCard label="Needs Review"       value={pendingReview}   icon={AlertTriangle} iconBg="bg-amber-50"      iconColor="text-db-marigold"  />
        <StatsCard label="In Review"          value={inReview}        icon={Clock}         iconBg="bg-blue-50"       iconColor="text-blue-600"     />
        <StatsCard label="Completed"          value={completedForms}  icon={CheckCircle2}  iconBg="bg-db-mint-light" iconColor="text-db-teal"      />
      </div>

      {/* ── Recent Form Submissions ──────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-db-black">Recent Form Submissions</h2>
          <Link href="/admin/submissions" className="text-sm text-db-teal hover:text-db-teal-dark font-medium transition-colors">
            View all →
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="db-card p-10 text-center">
            <FileText size={32} className="text-db-gray-300 mx-auto mb-3" />
            <p className="text-db-gray-400 text-sm">No form submissions yet.</p>
          </div>
        ) : (
          <div className="db-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-db-gray-100 bg-db-gray-50">
                  {['Ref #', 'Form Type', 'Status', 'Submitted By', 'Date', ''].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                      h === 'Submitted By' ? 'hidden lg:table-cell' :
                      h === 'Date'         ? 'hidden md:table-cell' : ''
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-db-gray-50">
                {recentSubmissions.map((sub) => {
                  const s = STATUS_STYLES[sub.status] ?? { label: sub.status, className: 'bg-db-gray-100 text-db-gray-600' }
                  return (
                    <tr key={sub.id} className="table-row-hover">
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs font-medium text-db-black">{sub.refNumber}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-db-black">{FORM_TYPE_LABELS[sub.type] ?? sub.type}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{sub.submittedBy.name}</td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-400">{formatDate(sub.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/admin/submissions/${sub.id}`} className="text-xs text-db-teal font-medium hover:text-db-teal-dark">
                          Review →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
