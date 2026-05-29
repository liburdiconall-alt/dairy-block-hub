export const FORM_TYPE_LABELS: Record<string, string> = {
  KEY_REQUEST:              'Key / Access Card Request',
  FITNESS_WAIVER:           'Fitness Center Waiver',
  PET_REGISTRATION:         'Pet Registration',
  EMERGENCY_COORDINATOR:    'Emergency Coordinator Form',
  HANDBOOK_ACKNOWLEDGEMENT: 'Handbook Acknowledgement',
  RETAIL_SALES_REPORT:      'Monthly Sales Report',
}

export const FORM_STATUS_LABELS: Record<string, string> = {
  SUBMITTED:  'Submitted',
  IN_REVIEW:  'In Review',
  COMPLETED:  'Completed',
  DENIED:     'Denied',
}

export const FORM_STATUS_COLORS: Record<string, string> = {
  SUBMITTED:  'bg-blue-50 text-blue-700 border-blue-200',
  IN_REVIEW:  'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED:  'bg-db-mint-light text-db-teal border-db-mint',
  DENIED:     'bg-red-50 text-db-red border-red-200',
}

export function generateRefNumber(type: string): string {
  const prefixes: Record<string, string> = {
    KEY_REQUEST:              'KEY',
    FITNESS_WAIVER:           'FIT',
    PET_REGISTRATION:         'PET',
    EMERGENCY_COORDINATOR:    'EMG',
    HANDBOOK_ACKNOWLEDGEMENT: 'HBK',
    RETAIL_SALES_REPORT:      'SAL',
  }
  const prefix = prefixes[type] ?? 'FORM'
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${datePart}-${rand}`
}
