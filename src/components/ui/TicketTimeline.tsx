import { STATUS_LABELS } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import type { HistoryEntry } from '@/types'

interface TicketTimelineProps {
  history: HistoryEntry[]
}

export function TicketTimeline({ history }: TicketTimelineProps) {
  return (
    <div className="space-y-0">
      {history.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-db-teal border-2 border-db-mint flex-shrink-0 mt-1" />
            {i < history.length - 1 && <div className="w-px flex-1 bg-db-gray-100 my-1" />}
          </div>
          <div className="pb-4">
            <p className="text-sm text-db-black">
              {entry.toStatus
                ? <>Status changed to <strong>{STATUS_LABELS[entry.toStatus]}</strong></>
                : 'Ticket created'
              }
            </p>
            {entry.note && (
              <p className="text-sm text-db-gray-500 italic mt-0.5">"{entry.note}"</p>
            )}
            <p className="text-xs text-db-gray-400 mt-1">
              {entry.changedBy.name} · {formatDateTime(entry.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
