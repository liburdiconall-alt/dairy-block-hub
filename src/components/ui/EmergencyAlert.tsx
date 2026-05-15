'use client'
import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { RequestWithRelations } from '@/types'

interface EmergencyAlertProps {
  requests: Pick<RequestWithRelations, 'id' | 'ticketNumber' | 'title' | 'type' | 'category' | 'createdAt' | 'submittedBy'>[]
}

export function EmergencyAlert({ requests }: EmergencyAlertProps) {
  if (requests.length === 0) return null

  return (
    <div className="rounded-2xl border-2 border-db-red/30 bg-red-50 p-5 shadow-emergency animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-db-red" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-db-red animate-ping opacity-50" />
        </div>
        <h3 className="font-display font-bold text-db-red text-base">
          {requests.length} Emergency Request{requests.length > 1 ? 's' : ''} — Immediate Attention Required
        </h3>
      </div>

      <div className="space-y-3">
        {requests.map((req) => (
          <Link
            key={req.id}
            href={`/admin/${req.type === 'MAINTENANCE' ? 'maintenance' : 'security'}/${req.ticketNumber}`}
            className="flex items-center justify-between bg-white rounded-xl p-4 border border-red-200 hover:border-db-red/60 transition-colors group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-db-red" />
                <span className="text-xs font-semibold text-db-red">{req.ticketNumber}</span>
                <span className="text-xs text-db-gray-400">{req.type === 'MAINTENANCE' ? 'Maintenance' : 'Security'} · {req.category}</span>
              </div>
              <p className="font-medium text-sm text-db-black">{req.title}</p>
              <p className="text-xs text-db-gray-400 mt-0.5">
                {req.submittedBy.name} · {formatDateTime(req.createdAt)}
              </p>
            </div>
            <ArrowRight size={16} className="text-db-gray-300 group-hover:text-db-red transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
