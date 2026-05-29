import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { FORM_TYPE_LABELS, FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '@/lib/forms'
import { FileText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Form Submissions' }

export default async function AdminSubmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') redirect('/admin/dashboard')

  const submissions = await prisma.formSubmission.findMany({
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const counts = {
    all:        submissions.length,
    submitted:  submissions.filter(s => s.status === 'SUBMITTED').length,
    in_review:  submissions.filter(s => s.status === 'IN_REVIEW').length,
    completed:  submissions.filter(s => s.status === 'COMPLETED').length,
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-3xl font-bold text-db-black">Form Submissions</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: counts.all,       color: 'text-db-black'  },
          { label: 'Submitted',  value: counts.submitted,  color: 'text-blue-600'  },
          { label: 'In Review',  value: counts.in_review,  color: 'text-amber-600' },
          { label: 'Completed',  value: counts.completed,  color: 'text-db-teal'   },
        ].map(s => (
          <div key={s.label} className="db-card p-4 text-center">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-db-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="db-card overflow-hidden">
        {submissions.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="text-db-gray-200 mx-auto mb-3" />
            <p className="text-sm text-db-gray-300">No form submissions yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Ref Number', 'Submitted By', 'Form Type', 'Status', 'Date', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    h === 'Form Type' ? 'hidden lg:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {submissions.map(s => (
                <tr key={s.id} className="table-row-hover">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-db-black font-mono text-xs">{s.refNumber}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-db-gray-700">{s.submittedBy.name}</p>
                    <p className="text-xs text-db-gray-400">{s.submittedBy.email}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">
                    {FORM_TYPE_LABELS[s.type] ?? s.type}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`db-badge text-xs ${FORM_STATUS_COLORS[s.status]}`}>
                      {FORM_STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-500">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/submissions/${s.refNumber}`}
                      className="text-xs font-semibold text-db-teal hover:text-db-teal-dark transition-colors"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
