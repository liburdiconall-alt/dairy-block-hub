import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TicketStatus, Urgency, RequestType } from '@prisma/client'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Ticket number generator ──────────────────────────────────────────────────

export function generateTicketNumber(type: RequestType): string {
  const year  = new Date().getFullYear()
  const rand  = Math.floor(Math.random() * 9000) + 1000
  const prefix = type === 'MAINTENANCE' ? 'MT' : 'SC'
  return `DB-${prefix}-${year}-${rand}`
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<TicketStatus, string> = {
  SUBMITTED:        'Submitted',
  UNDER_REVIEW:     'Under Review',
  APPROVED:         'Approved',
  DENIED:           'Denied',
  ASSIGNED:         'Assigned',
  SCHEDULED:        'Scheduled',
  IN_PROGRESS:      'In Progress',
  WAITING_ON_VENDOR:'Waiting on Vendor',
  WAITING_ON_TENANT:'Waiting on Tenant',
  COMPLETED:        'Completed',
  CLOSED:           'Closed',
}

export const STATUS_COLORS: Record<TicketStatus, string> = {
  SUBMITTED:        'bg-db-gray-100 text-db-gray-700',
  UNDER_REVIEW:     'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED:         'bg-db-mint-light text-db-teal-dark border border-db-mint',
  DENIED:           'bg-red-50 text-db-red border border-red-200',
  ASSIGNED:         'bg-orange-50 text-db-orange border border-orange-200',
  SCHEDULED:        'bg-purple-50 text-purple-700 border border-purple-200',
  IN_PROGRESS:      'bg-blue-50 text-blue-700 border border-blue-200',
  WAITING_ON_VENDOR:'bg-yellow-50 text-yellow-700 border border-yellow-200',
  WAITING_ON_TENANT:'bg-yellow-50 text-yellow-700 border border-yellow-200',
  COMPLETED:        'bg-db-teal/10 text-db-teal border border-db-teal/30',
  CLOSED:           'bg-db-gray-100 text-db-gray-500',
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  LOW:       'Low',
  MEDIUM:    'Medium',
  HIGH:      'High',
  EMERGENCY: 'Emergency',
}

export const URGENCY_COLORS: Record<Urgency, string> = {
  LOW:       'bg-db-gray-100 text-db-gray-600',
  MEDIUM:    'bg-amber-50 text-amber-700 border border-amber-200',
  HIGH:      'bg-orange-50 text-db-orange border border-orange-200',
  EMERGENCY: 'bg-red-50 text-db-red border border-red-200 font-semibold',
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const MAINTENANCE_CATEGORIES = [
  'HVAC', 'Plumbing', 'Electrical', 'Lighting', 'Janitorial',
  'Elevator', 'Appliance', 'General Repair', 'Emergency Maintenance',
]

export const SECURITY_CATEGORIES = [
  'Suspicious Activity', 'Access Control Issue', 'Lost Key or Badge',
  'Lock/Unlock Request', 'Safety Concern', 'After-Hours Escort Request',
  'Incident Report', 'Noise or Disturbance', 'Trespassing Concern',
  'Emergency Security Issue',
]

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ─── File size ────────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Expected response time ───────────────────────────────────────────────────

export function getExpectedResponse(urgency: Urgency): string {
  switch (urgency) {
    case 'EMERGENCY': return 'Within 1 hour'
    case 'HIGH':      return 'Within 4 hours'
    case 'MEDIUM':    return 'Within 24 hours'
    case 'LOW':       return 'Within 3–5 business days'
  }
}
