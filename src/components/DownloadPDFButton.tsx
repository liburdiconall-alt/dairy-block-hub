'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { PDFSubmissionData } from '@/lib/pdf-generation'

type Props = {
  submission: PDFSubmissionData
  variant?: 'primary' | 'outline' | 'ghost'
}

export function DownloadPDFButton({ submission, variant = 'primary' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const { generateFormSubmissionPDF } = await import('@/lib/pdf-generation')
      generateFormSubmissionPDF(submission)
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    primary: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-db-mint-light text-db-teal border border-db-mint text-sm font-semibold hover:bg-db-mint transition-colors disabled:opacity-50',
    outline: 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-db-gray-200 text-db-gray-600 text-xs font-semibold hover:border-db-teal hover:text-db-teal transition-colors disabled:opacity-50',
    ghost:   'inline-flex items-center gap-1.5 text-xs font-semibold text-db-teal hover:text-db-teal-dark transition-colors disabled:opacity-50',
  }

  return (
    <button onClick={handleDownload} disabled={loading} className={styles[variant]}>
      <Download size={variant === 'primary' ? 14 : 12} />
      {loading ? 'Generating…' : 'Download PDF'}
    </button>
  )
}
