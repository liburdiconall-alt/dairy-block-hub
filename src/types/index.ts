import { Role, RequestType, Urgency, TicketStatus, Department } from '@prisma/client'

export type { Role, RequestType, Urgency, TicketStatus, Department }

// ─── Session extension ────────────────────────────────────────────────────────

declare module 'next-auth' {
  interface User {
    role: Role
    id: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    id: string
  }
}

// ─── Request with relations ───────────────────────────────────────────────────

export interface RequestWithRelations {
  id: string
  ticketNumber: string
  type: RequestType
  category: string
  title: string
  description: string
  urgency: Urgency
  status: TicketStatus
  location: string | null
  floor: string | null
  isEmergency: boolean
  denialReason: string | null
  scheduledFor: Date | null
  completedAt: Date | null
  closedAt: Date | null
  createdAt: Date
  updatedAt: Date
  submittedBy: UserSummary
  assignedTo: UserSummary | null
  comments: CommentWithAuthor[]
  internalNotes: NoteWithAuthor[]
  attachments: AttachmentItem[]
  history: HistoryEntry[]
  maintenanceDetail: MaintenanceDetailItem | null
  securityDetail: SecurityDetailItem | null
}

export interface UserSummary {
  id: string
  name: string | null
  email: string
  role: Role
  tenantInfo: { unit: string | null; building: string | null; company: string | null } | null
  staffInfo: { department: Department; badge: string | null } | null
}

export interface CommentWithAuthor {
  id: string
  content: string
  isInternal: boolean
  createdAt: Date
  author: UserSummary
}

export interface NoteWithAuthor {
  id: string
  content: string
  createdAt: Date
  author: UserSummary
}

export interface AttachmentItem {
  id: string
  url: string
  filename: string
  fileType: string
  fileSize: number
  createdAt: Date
}

export interface HistoryEntry {
  id: string
  fromStatus: TicketStatus | null
  toStatus: TicketStatus | null
  note: string | null
  createdAt: Date
  changedBy: UserSummary
}

export interface MaintenanceDetailItem {
  id: string
  laborHours: number | null
  materials: string | null
  estimatedCost: number | null
  actualCost: number | null
  vendorName: string | null
  vendorContact: string | null
  isPreventive: boolean
  completionNotes: string | null
  workOrderNumber: string | null
}

export interface SecurityDetailItem {
  id: string
  incidentDate: Date | null
  incidentLocation: string | null
  personsInvolved: string | null
  witnesses: string | null
  riskLevel: string | null
  followUpRequired: boolean
  isConfidential: boolean
  escalatedToMgmt: boolean
  officerBadge: string | null
  reportNumber: string | null
}

// ─── Form types ───────────────────────────────────────────────────────────────

export interface NewRequestFormData {
  type: RequestType
  category: string
  title: string
  description: string
  urgency: Urgency
  location: string
  floor: string
  // Security-specific
  incidentDate?: string
  personsInvolved?: string
  witnesses?: string
}

export interface StatusUpdateData {
  status: TicketStatus
  note?: string
  denialReason?: string
  scheduledFor?: string
}

export interface AssignData {
  assignedToId: string
  note?: string
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number
  active: number
  pending: number
  emergency: number
  completedThisMonth: number
  avgResponseHours: number
}
