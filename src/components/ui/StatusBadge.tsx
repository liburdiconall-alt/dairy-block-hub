import { TicketStatus, Urgency } from '@prisma/client'
import { STATUS_LABELS, STATUS_COLORS, URGENCY_LABELS, URGENCY_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface StatusBadgeProps {
  status: TicketStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span className={cn(
      'db-badge',
      STATUS_COLORS[status],
      size === 'sm' && 'text-[11px] px-2 py-0.5'
    )}>
      {STATUS_LABELS[status]}
    </span>
  )
}

interface UrgencyBadgeProps {
  urgency: Urgency
  size?: 'sm' | 'md'
}

export function UrgencyBadge({ urgency, size = 'md' }: UrgencyBadgeProps) {
  return (
    <span className={cn(
      'db-badge',
      URGENCY_COLORS[urgency],
      size === 'sm' && 'text-[11px] px-2 py-0.5'
    )}>
      {urgency === 'EMERGENCY' && <AlertTriangle size={10} className="flex-shrink-0" />}
      {URGENCY_LABELS[urgency]}
    </span>
  )
}

interface TypeBadgeProps {
  type: 'MAINTENANCE' | 'SECURITY'
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className={cn(
      'db-badge',
      type === 'MAINTENANCE'
        ? 'bg-db-teal/10 text-db-teal border border-db-teal/20'
        : 'bg-db-orange/10 text-db-orange border border-db-orange/20'
    )}>
      {type === 'MAINTENANCE' ? 'Maintenance' : 'Security'}
    </span>
  )
}
