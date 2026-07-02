import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { FORM_TYPE_LABELS, FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '@/lib/forms'
import { DownloadPDFButton } from '@/components/DownloadPDFButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Submissions' }

export default async function TenantSubmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const submissions = await prisma.formSubmission.findMany({
    where:   { submittedById: session.user.id },
    include: {
      submittedBy: { select: { name: true, email: true, tenantInfo: true } },
      reviewedBy:  { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">

      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/forms" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black transition-colors mb-2">
            <ArrowLeft size={14} /> Forms & Documents
          </Link>
          <h1 className="font-display text-2xl font-bold text-db-black">My Submissions</h1>
          <p className="text-sm text-db-gray-400 mt-0.5">Download PDF copies of your submitted forms.</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="db-card py-16 text-center">
          <FileText size={32} className="text-db-gray-200 mx-auto mb-3" />
          <p className="text-sm text-db-gray-400">No submissions yet.</p>
          <Link href="/forms" className="mt-4 inline-block text-sm font-semibold text-db-teal hover:text-db-teal-dark transition-colors">
            Browse available forms →
          </Link>
        </div>
      ) : (
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Form', 'Ref Number', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {submissions.map(s => {
                const formData = s.formData as Record<string, unknown>
                const stripped = { ...formData }
                delete stripped.supportingReportData

                const pdfData = {
                  refNumber:   s.refNumber,
                  type:        s.type,
                  status:      s.status,
                  formData:    stripped,
                  adminNotes:  s.adminNotes,
                  createdAt:   s.createdAt.toISOString(),
                  submittedBy: {
                    name:       s.submittedBy.name ?? '',
                    email:      s.submittedBy.email ?? '',
                    tenantInfo: s.submittedBy.tenantInfo
                      ? { unit: s.submittedBy.tenantInfo.unit ?? null, company: s.submittedBy.tenantInfo.company ?? null }
                      : null,
                  },
                  reviewedBy: s.reviewedBy ? { name: s.reviewedBy.name ?? '' } : null,
                }

                return (
                  <tr key={s.id} className="hover:bg-db-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-db-gray-700">
                      {FORM_TYPE_LABELS[s.type] ?? s.type}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs text-db-gray-500">{s.refNumber}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`db-badge text-xs ${FORM_STATUS_COLORS[s.status]}`}>
                        {FORM_STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-db-gray-400">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <DownloadPDFButton submission={pdfData} variant="ghost" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
