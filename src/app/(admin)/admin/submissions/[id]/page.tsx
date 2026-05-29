import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { FORM_TYPE_LABELS, FORM_STATUS_LABELS, FORM_STATUS_COLORS } from '@/lib/forms'
import { FormSubmissionControls } from './FormSubmissionControls'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Form Submission Detail' }

export default async function AdminSubmissionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PROPERTY_MANAGER') redirect('/admin/dashboard')

  const submission = await prisma.formSubmission.findUnique({
    where:   { refNumber: params.id },
    include: {
      submittedBy: { select: { name: true, email: true, tenantInfo: true } },
      reviewedBy:  { select: { name: true } },
    },
  })

  if (!submission) notFound()

  const formData = submission.formData as Record<string, unknown>

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <Link href="/admin/submissions" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black transition-colors">
        <ArrowLeft size={15} /> Back to Form Submissions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="db-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-db-gray-400 tracking-wider mb-1 font-mono">{submission.refNumber}</p>
                <h1 className="font-display text-2xl font-bold text-db-black">
                  {FORM_TYPE_LABELS[submission.type] ?? submission.type}
                </h1>
                <p className="text-xs text-db-gray-400 mt-1">Submitted {formatDateTime(submission.createdAt)}</p>
              </div>
              <span className={`db-badge shrink-0 ${FORM_STATUS_COLORS[submission.status]}`}>
                {FORM_STATUS_LABELS[submission.status]}
              </span>
            </div>
          </div>

          {/* Form data */}
          <div className="db-card p-6">
            <h2 className="font-display text-base font-bold text-db-black mb-4">Form Data</h2>
            {Object.keys(formData).length === 0 ? (
              <p className="text-sm text-db-gray-400 italic">No form data recorded.</p>
            ) : (
              <dl className="divide-y divide-db-gray-100">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="py-2.5 grid grid-cols-2 gap-4 text-sm">
                    <dt className="text-db-gray-400 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-db-black">{String(value ?? '—')}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Admin notes if set */}
          {submission.adminNotes && (
            <div className="db-card p-5 border-l-4 border-db-teal bg-db-mint-light">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-db-teal">Admin Notes</p>
              <p className="text-sm text-db-gray-700">{submission.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Submitter info */}
          <div className="db-card p-5">
            <h3 className="font-display text-sm font-bold text-db-black mb-3">Submitted By</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium text-db-black">{submission.submittedBy.name}</p>
              <p className="text-xs text-db-gray-400">{submission.submittedBy.email}</p>
              {submission.submittedBy.tenantInfo?.unit && (
                <p className="text-xs text-db-gray-400">Unit {submission.submittedBy.tenantInfo.unit}</p>
              )}
              {submission.submittedBy.tenantInfo?.company && (
                <p className="text-xs text-db-gray-400">{submission.submittedBy.tenantInfo.company}</p>
              )}
            </div>
            <p className="text-xs text-db-gray-300 mt-3">Submitted {formatDateTime(submission.createdAt)}</p>
            {submission.reviewedBy && (
              <p className="text-xs text-db-gray-400 mt-1">Reviewed by {submission.reviewedBy.name}</p>
            )}
          </div>

          {/* Action controls */}
          <FormSubmissionControls submission={submission} />
        </div>
      </div>
    </div>
  )
}
