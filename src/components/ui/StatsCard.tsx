import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: string; positive: boolean }
  className?: string
}

export function StatsCard({
  label, value, icon: Icon,
  iconColor = 'text-db-teal',
  iconBg = 'bg-db-mint-light',
  trend, className,
}: StatsCardProps) {
  return (
    <div className={cn('db-card p-5 hover:shadow-card-hover transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-db-red'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-db-black mb-1">{value}</p>
      <p className="text-sm text-db-gray-400">{label}</p>
    </div>
  )
}
