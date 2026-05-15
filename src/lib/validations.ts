import { z } from 'zod'
import { RequestType, Urgency } from '@prisma/client'

export const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  unit:     z.string().optional(),
  building: z.string().optional(),
  company:  z.string().optional(),
  phone:    z.string().optional(),
})

export const newRequestSchema = z.object({
  type:        z.nativeEnum(RequestType),
  category:    z.string().min(1, 'Please select a category'),
  title:       z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title too long'),
  description: z.string().min(20, 'Please provide more detail (minimum 20 characters)').max(2000),
  urgency:     z.nativeEnum(Urgency),
  location:    z.string().min(1, 'Please provide a location'),
  floor:       z.string().optional(),
  // Security-specific
  incidentDate:     z.string().optional(),
  personsInvolved:  z.string().optional(),
  witnesses:        z.string().optional(),
})

export const statusUpdateSchema = z.object({
  status:       z.string().min(1, 'Status is required'),
  note:         z.string().optional(),
  denialReason: z.string().optional(),
  scheduledFor: z.string().optional(),
})

export const assignSchema = z.object({
  assignedToId: z.string().min(1, 'Please select a staff member'),
  note:         z.string().optional(),
})

export const commentSchema = z.object({
  content:    z.string().min(1, 'Comment cannot be empty').max(1000),
  isInternal: z.boolean().default(false),
})

export const maintenanceDetailSchema = z.object({
  laborHours:      z.number().min(0).optional(),
  materials:       z.string().optional(),
  estimatedCost:   z.number().min(0).optional(),
  actualCost:      z.number().min(0).optional(),
  vendorName:      z.string().optional(),
  vendorContact:   z.string().optional(),
  isPreventive:    z.boolean().default(false),
  completionNotes: z.string().optional(),
})

export const securityDetailSchema = z.object({
  riskLevel:       z.string().optional(),
  followUpRequired:z.boolean().default(false),
  isConfidential:  z.boolean().default(false),
  escalatedToMgmt: z.boolean().default(false),
  reportNumber:    z.string().optional(),
})

export type LoginInput            = z.infer<typeof loginSchema>
export type RegisterInput         = z.infer<typeof registerSchema>
export type NewRequestInput       = z.infer<typeof newRequestSchema>
export type StatusUpdateInput     = z.infer<typeof statusUpdateSchema>
export type AssignInput           = z.infer<typeof assignSchema>
export type CommentInput          = z.infer<typeof commentSchema>
export type MaintenanceDetailInput= z.infer<typeof maintenanceDetailSchema>
export type SecurityDetailInput   = z.infer<typeof securityDetailSchema>
