// Form-replica PDF generation for submitted forms.
// Dynamically imported client-side only — never imported at build/SSR time.

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type PDFSubmissionData = {
  refNumber:   string
  type:        string
  status:      string
  formData:    Record<string, unknown>
  adminNotes:  string | null
  createdAt:   string
  submittedBy: { name: string; email: string; tenantInfo: { unit: string | null; company: string | null } | null }
  reviewedBy:  { name: string } | null
}

// ── Brand colors ──────────────────────────────────────────────────────────────
type RGB = [number, number, number]
const TEAL:       RGB = [41,  150, 127]
const MINT:       RGB = [196, 219, 203]
const MINT_LIGHT: RGB = [232, 242, 236]
const BLACK:      RGB = [0,   0,   0]
const WHITE:      RGB = [255, 255, 255]
const GRAY_50:    RGB = [249, 250, 251]
const GRAY_100:   RGB = [243, 244, 246]
const GRAY_200:   RGB = [229, 231, 235]
const GRAY_400:   RGB = [156, 163, 175]
const GRAY_600:   RGB = [75,  85,  99]
const GRAY_700:   RGB = [55,  65,  81]
const AMBER_50:   RGB = [255, 251, 235]
const AMBER_700:  RGB = [180, 83,  9]
const RED_50:     RGB = [254, 226, 226]
const RED_700:    RGB = [185, 28,  28]

const STATUS_COLORS: Record<string, { bg: RGB; text: RGB }> = {
  SUBMITTED: { bg: [219, 234, 254], text: [29,  78,  216] },
  IN_REVIEW: { bg: [254, 243, 199], text: [146, 64,  14]  },
  COMPLETED: { bg: MINT_LIGHT,      text: TEAL             },
  DENIED:    { bg: [254, 226, 226], text: [220, 38,  38]  },
}

const FORM_TYPE_LABELS: Record<string, string> = {
  KEY_REQUEST:              'Key / Access Card Request',
  FITNESS_WAIVER:           'Fitness Center Waiver, Release & Indemnification',
  PET_REGISTRATION:         'Pet Registration',
  EMERGENCY_COORDINATOR:    'Emergency Coordinator Form',
  HANDBOOK_ACKNOWLEDGEMENT: 'Handbook Acknowledgement',
  RETAIL_SALES_REPORT:      'Monthly Sales Report',
}

const FORM_STATUS_LABELS: Record<string, string> = {
  SUBMITTED:  'Submitted',
  IN_REVIEW:  'In Review',
  COMPLETED:  'Completed',
  DENIED:     'Denied',
}

// ── Static form content (mirrors form pages exactly) ──────────────────────────
const KEY_CARD_TYPE_OPTIONS = [
  'Replace lost/damaged Access Card',
  'New Access Card',
  'Building Key',
  'Suite Key',
  'Program existing Access Card',
  'Deactivate Access Card',
]

const COMPANY_TYPE_OPTIONS = [
  'Property Mgmt', 'Janitorial', 'Security', 'Contractor',
  'Leasing', 'Building Tenant', 'Bike Storage Access', 'Fitness Center Access',
]

const FITNESS_ROOM_OPTIONS = ["Ladies' Locker Room", "Men's Locker Room"]

const KEY_CONDITIONS = [
  'Access Card replacement: $25.00',
  'Key replacement: $50.00 + costs associated with re-keying',
  'Technician labor (if applicable): $83.68/hr',
  'Keys and access cards remain the property of McWhinney Property Management and must be returned upon request or at lease termination. Duplication of keys or sharing of access cards is prohibited. Loss or theft must be reported immediately.',
]

const FITNESS_WAIVER_TEXT = `FITNESS CENTER WAIVER, RELEASE, AND INDEMNIFICATION

The following individual executes this Fitness Center Waiver, Release, and Indemnification ("Waiver") for the benefit of: BLK22O, LLC ("Landlord"), McWhinney Property Management, LLC ("Property Manager"), Sage Client 263, LLC ("Facility Manager"), McWhinney Real Estate Services, Inc., ZBH, LLC, Firehouse Block, LLC, ZBlock Association, each of their respective directors, members, managers, officers, partners, shareholders, trustees, affiliates, subsidiaries, employees, agents, representatives, contractors, subcontractors, successors, assigns, volunteers, invitees and guests, and any affiliated or subsidiary companies, corporations, partnerships, firms, entities or trusts, as may now or hereafter be constituted, and any other entity of any nature which these named entities maintain the majority of ownership or financial or management control (hereafter, collectively "Released Parties"), for the privilege of utilizing the fitness center located at 1825 Blake Street Denver, CO 80202 (the "Center") based on the following terms and conditions:

WAIVER AND RELEASE OF CLAIMS (INCLUDING NEGLIGENCE)

IN CONSIDERATION OF USER'S USE OF THE CENTER AND TO THE FULLEST EXTENT ALLOWED BY APPLICABLE LAW, USER, ON USER'S BEHALF AND ON BEHALF OF ITS PERSONAL REPRESENTATIVES, WAIVES AND RELEASES RELEASED PARTIES FROM ANY AND ALL CLAIMS, DEMANDS, CAUSES OF ACTION, DAMAGES, JUDGMENTS, AWARDS, LOSSES, COSTS, FINES, PENALTIES OR SUITS AT LAW AND EQUITY OF WHATSOEVER KIND, INCLUDING BUT NOT LIMITED TO CLAIMS FOR PERSONAL INJURY (INCLUDING DEATH), PROPERTY DAMAGE, THEFT, MEDICAL EXPENSES, LOSS OF SERVICES, OR ATTORNEY'S FEES (COLLECTIVELY, "LIABILITIES"), ON ACCOUNT OF OR IN ANY WAY RELATED TO OR GROWING OUT OF, DIRECTLY OR INDIRECTLY, (I) USER'S USE OF THE CENTER, (II) THE NEGLIGENCE OR INTENTIONAL MISCONDUCT OF THIRD PARTY USERS OF THE CENTER, (III) THE FAILURE BY USER TO SECURE ANY PERSONAL PROPERTY OF USER WITHIN THE CENTER, (IV) FAILURE OF USER TO COMPLY WITH ANY APPLICABLE FEDERAL, STATE, OR LOCAL LAW OR REGULATION, OR (V) USERS BREACH OF THE TERMS AND CONDITIONS OF THIS WAIVER (ALL OF THE FOREGOING REFERRED TO HEREIN AS THE "WAIVED CLAIMS").

THIS WAIVER IS INTENDED TO AND DOES RELEASE THE RELEASED PARTIES FROM ANY AND ALL LIABILITY FOR DAMAGES OR INJURIES ON ACCOUNT OF OR IN ANY WAY RELATED TO OR GROWING OUT OF USER'S NEGLIGENCE AND THE NEGLIGENCE OF THIRD PARTIES (TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW), INCLUDING BUT NOT LIMITED TO NEGLIGENCE IN THE CONSTRUCTION, MAINTENANCE AND UPKEEP OF THE CENTER AND ITS EQUIPMENT, NEGLIGENCE IN TRAINING, NEGLIGENCE IN SUPERVISION, OR VIOLATION OF ANY APPLICABLE SAFE PLACE STATUTE. THIS IS NOT INTENDED TO RELEASE ANY RELEASED PARTIES FROM ANY LIABILITY TO THE EXTENT RESULTING FROM THEIR GROSS NEGLIGENCE OR INTENTIONAL MISCONDUCT.

User acknowledges that no Released Parties will be providing to User any security services or any other supervision relating to the Center and that User assumes the risk, on User's behalf, with respect to any destruction, damage or theft to any personal property of User located within the Center during User's use of such Center or any personal injury which occurs during such use. Except to the extent caused by the gross negligence or intentional misconduct of any of the Released Parties, any claims specifically arising out of this paragraph shall be considered Waived Claims hereunder.

If User fails to remove any personal property of User after its use of the Center, the Released Parties shall be under no obligation to safeguard such personal property or attempt to locate the rightful owner of such personal property. Such personal property shall be deemed abandoned and shall, at the option of the Released Parties, become the property of Landlord, Property Manager or Facility Manager, or may be stored at User's expense, sold or otherwise disposed of by the Released Parties without any liability of accounting to User.

User understands that if, for any reason, User is or has been under medical supervision or if User has not exercised regularly in the recent past, that a doctor's approval should be obtained prior to use of the Center's facilities or equipment. User understands and agrees that it is User's sole responsibility to obtain a doctor's approval, and User holds the Released Parties harmless therefore.

While at the center User agrees to conduct itself in a responsible manner, and shall refrain from engaging in inappropriate conduct, including the use of loud, foul, slanderous language, or any intimidating or offensive conduct which would interfere with the peaceful use and enjoyment of the Center by other users.

User agrees to comply with all notices, rules and/or regulations posted in the Center, including without limitation, any posted hours of operation. User's use of the Center shall be limited to the period of time User is an office tenant at Dairy Block or a hotel patron at The Maven; otherwise, User shall have no right to use the Center at any other time.

Any illegal drugs, alcoholic beverages, intoxicants and criminal conduct are prohibited in the Center.

User agrees to extend common courtesies to other users. If there are other users waiting to use the exercise equipment, User agrees to vacate the equipment promptly when finished.

Landlord, Property Manager or Facility Manager reserve the right to alter, modify and/or change its hours of business, as well as any equipment, programs and/or staff without notice to or liability to User.

User further covenants and agrees not to institute any claims or legal action against the Released Parties for any Waived Claims released by this Waiver. User further agrees that User will protect, defend, hold harmless and completely indemnify and reimburse any of the Released Parties for any and all Liabilities to the extent they arise directly or indirectly from or in connection with any Waived Claims, including without limitation any related claims made by any User (or in the event of death, by User's personal representatives) or other third parties.

User has been provided with an opportunity to review the foregoing Waiver and to have this Waiver reviewed by legal counsel of User's choosing. User has read this Waiver and understands that by signing this Waiver, User has consented to be bound by its terms, including the waiver/release of any legal right User may have to sue the Released Parties for any injuries or damages User may sustain and User's obligations to reimburse the Released Parties for any costs, including attorneys' fees they incur because a claim or legal action is brought in violation of this Waiver.

User agrees any violation of the foregoing Waiver and its terms and conditions, as determined by Landlord, Property Manager or Facility Manager, shall void and terminate User's right to utilize the Center in accordance with this Waiver.

This Waiver shall be governed by the laws of the state of Colorado.`

const PET_POLICY_PARAGRAPHS = [
  'A pet may be allowed in the office if its health and behavior are acceptable within an office setting, and if it does not adversely affect the operations of the Dairy Block project. A pet owner wishing to bring a pet to the office should first obtain written permission from the management of Dairy Block. Any decision to allow a pet to come to the center, or to exclude a pet from the center, will be made by the center\'s management. That decision will be final.',
  'An employee who requires the help of a service animal (defined by 28 CFR 36.104 as "any dog that is individually trained to do work or perform tasks for the benefit of an individual with a disability") will be permitted to bring a service animal to Dairy Block, provided that the animal\'s presence does not create a danger to others and does not impose an undue hardship upon the company.',
  'Pets are not allowed inside food and beverage establishments except in outdoor patio seating areas only, and at the discretion of the restaurant or store manager.',
  'In all cases the privilege of bringing a pet to work is subordinate to the health, safety, and comfort of persons who may come into contact with animals at the site. An animal may be excluded from Dairy Block if it: causes any person to experience allergic reactions, fear, or any other physical or psychological discomfort; or distracts from the operation and ambiance of Dairy Block.',
  'Any individual with a grievance regarding an animal at Dairy Block should bring the matter to the attention of the management of the Dairy Block. The following animals may not be brought to the workplace: sick animals; animals with fleas or any disease that is communicable to other animals at the site or to humans; animals that have not been properly vaccinated, or that have internal or external parasites; dogs that bark or behave aggressively; or animals that foul the inside or outside of the building.',
  'Animals that have not been spayed or neutered will not be permitted to come to the office. All dogs must be leashed at all times. A photo and immunization record must be provided before the animal is allowed on the premises. All animals must be in the continuous full control of their owners. They should be in the physical presence of the owner, in the owner\'s office, at all times. Owners are expected to clean up, completely and immediately, after their animals.',
  'An employee who brings an animal to the office as well as the company the employee works for is completely and solely liable for any injuries or any damage to personal property caused by the animal. Any repair or cleaning/maintenance costs incurred by an animal will be charged and billed accordingly.',
  'The ownership of Dairy Block may, at its discretion, require animal owner to maintain a liability insurance policy covering damage or injuries caused by the animal while at the site.',
  'Dairy Block ownership shall not be liable for loss of, or injury to, any animal brought to the office.',
]

// ── Context ───────────────────────────────────────────────────────────────────
type Ctx = { doc: jsPDF; y: number; pageW: number; pageH: number; M: number; CW: number; formLabel: string; refNumber: string }

function mkCtx(doc: jsPDF, formLabel: string, refNumber: string): Ctx {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  return { doc, y: 0, pageW, pageH, M: 40, CW: pageW - 80, formLabel, refNumber }
}

function addNewPage(c: Ctx): void {
  c.doc.addPage()
  c.doc.setFillColor(...TEAL)
  c.doc.rect(0, 0, c.pageW, 18, 'F')
  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(6.5)
  c.doc.setTextColor(...WHITE)
  c.doc.text(`DAIRY BLOCK  ·  ${c.formLabel}  ·  ${c.refNumber}`, c.M, 12)
  c.y = 28
}

function ensure(c: Ctx, needed: number): void {
  if (c.y + needed > c.pageH - 44) addNewPage(c)
}

// ── Layout helpers ────────────────────────────────────────────────────────────
function gap(c: Ctx, h = 8): void { c.y += h }

function divider(c: Ctx): void {
  ensure(c, 8)
  c.doc.setDrawColor(...GRAY_200)
  c.doc.setLineWidth(0.5)
  c.doc.line(c.M, c.y, c.M + c.CW, c.y)
  c.y += 8
}

function sectionHead(c: Ctx, label: string): void {
  ensure(c, 22)
  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(7)
  c.doc.setTextColor(...GRAY_400)
  c.doc.text(label.toUpperCase(), c.M, c.y)
  c.y += 4
  c.doc.setDrawColor(...GRAY_200)
  c.doc.setLineWidth(0.5)
  c.doc.line(c.M, c.y, c.M + c.CW, c.y)
  c.y += 10
}

// ── Field rendering ───────────────────────────────────────────────────────────
const FH = 22   // field box height
const LH = 10   // label row height
const RH = FH + LH + 7   // total row height

function drawField(c: Ctx, label: string, value: string | null | undefined, x: number, y: number, w: number): void {
  const val = (value ?? '').trim() || '—'
  const empty = val === '—'

  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(7)
  c.doc.setTextColor(...GRAY_400)
  c.doc.text(label, x, y + LH - 2)

  if (empty) { c.doc.setFillColor(...GRAY_50) } else { c.doc.setFillColor(255, 255, 255) }
  c.doc.setDrawColor(...GRAY_200)
  c.doc.setLineWidth(0.5)
  c.doc.roundedRect(x, y + LH, w, FH, 2, 2, 'FD')

  c.doc.setFont('helvetica', empty ? 'italic' : 'normal')
  c.doc.setFontSize(9)
  if (empty) { c.doc.setTextColor(...GRAY_400) } else { c.doc.setTextColor(...BLACK) }
  const truncated = c.doc.splitTextToSize(val, w - 12)[0] as string
  c.doc.text(truncated, x + 6, y + LH + 14)
}

function fields(c: Ctx, items: Array<{ label: string; value?: string | null }>): void {
  ensure(c, RH)
  const gap6 = 6
  const n = items.length
  const fw = (c.CW - gap6 * (n - 1)) / n
  items.forEach((it, i) => drawField(c, it.label, it.value, c.M + i * (fw + gap6), c.y, fw))
  c.y += RH
}

function fullField(c: Ctx, label: string, value?: string | null): void {
  ensure(c, RH)
  drawField(c, label, value, c.M, c.y, c.CW)
  c.y += RH
}

// Textarea-style taller field for multi-line content
function textareaField(c: Ctx, label: string, value?: string | null): void {
  const val = (value ?? '').trim() || '—'
  const empty = val === '—'
  const th = 48

  ensure(c, LH + th + 7)
  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(7)
  c.doc.setTextColor(...GRAY_400)
  c.doc.text(label, c.M, c.y + LH - 2)

  if (empty) { c.doc.setFillColor(...GRAY_50) } else { c.doc.setFillColor(255, 255, 255) }
  c.doc.setDrawColor(...GRAY_200)
  c.doc.setLineWidth(0.5)
  c.doc.roundedRect(c.M, c.y + LH, c.CW, th, 2, 2, 'FD')

  c.doc.setFont('helvetica', empty ? 'italic' : 'normal')
  c.doc.setFontSize(8.5)
  if (empty) { c.doc.setTextColor(...GRAY_400) } else { c.doc.setTextColor(...BLACK) }
  const lines = c.doc.splitTextToSize(val, c.CW - 12) as string[]
  lines.slice(0, 4).forEach((ln, i) => c.doc.text(ln, c.M + 6, c.y + LH + 12 + i * 10))
  c.y += LH + th + 7
}

// ── Checkbox & radio ──────────────────────────────────────────────────────────
function checkItem(c: Ctx, checked: boolean, label: string, indent = 0): void {
  const labelLines = c.doc.splitTextToSize(label, c.CW - indent - 18) as string[]
  const h = Math.max(16, labelLines.length * 10 + 4)
  ensure(c, h)

  const bx = c.M + indent
  const by = c.y + 1
  if (checked) { c.doc.setFillColor(...TEAL) } else { c.doc.setFillColor(255, 255, 255) }
  c.doc.setDrawColor(checked ? TEAL[0] : GRAY_200[0], checked ? TEAL[1] : GRAY_200[1], checked ? TEAL[2] : GRAY_200[2])
  c.doc.setLineWidth(0.75)
  c.doc.roundedRect(bx, by, 10, 10, 1.5, 1.5, 'FD')
  if (checked) {
    c.doc.setFont('helvetica', 'bold')
    c.doc.setFontSize(7)
    c.doc.setTextColor(255, 255, 255)
    c.doc.text('✓', bx + 1.8, by + 8)
  }
  c.doc.setFont('helvetica', checked ? 'bold' : 'normal')
  c.doc.setFontSize(8.5)
  c.doc.setTextColor(...GRAY_700)
  labelLines.forEach((ln, i) => c.doc.text(ln, bx + 16, by + 8 + i * 10))
  c.y += h
}

function checkboxGroup(c: Ctx, options: string[], selected: string[]): void {
  options.forEach(opt => { gap(c, 1); checkItem(c, selected.includes(opt), opt, 2) })
}

function radioGroup(c: Ctx, options: string[], selected: string, cols = 1): void {
  const colW = (c.CW - 6 * (cols - 1)) / cols
  let col = 0, rowY = c.y

  options.forEach((opt, idx) => {
    if (col === 0) { ensure(c, 18); rowY = c.y }
    const x = c.M + col * (colW + 6)
    const sel = selected === opt
    c.doc.setFillColor(sel ? TEAL[0] : 255, sel ? TEAL[1] : 255, sel ? TEAL[2] : 255)
    c.doc.setDrawColor(sel ? TEAL[0] : GRAY_200[0], sel ? TEAL[1] : GRAY_200[1], sel ? TEAL[2] : GRAY_200[2])
    c.doc.setLineWidth(0.75)
    c.doc.circle(x + 5, rowY + 5.5, 5, 'FD')
    if (sel) { c.doc.setFillColor(255, 255, 255); c.doc.circle(x + 5, rowY + 5.5, 2, 'F') }
    c.doc.setFont('helvetica', sel ? 'bold' : 'normal')
    c.doc.setFontSize(9)
    c.doc.setTextColor(...BLACK)
    c.doc.text(opt, x + 14, rowY + 8.5)
    col++
    if (col >= cols || idx === options.length - 1) { col = 0; c.y = rowY + 18 }
  })
}

// ── Policy / long text block ──────────────────────────────────────────────────
function policyBlock(c: Ctx, paragraphs: string[]): void {
  const pad = 8
  const textW = c.CW - pad * 2

  const allLines: string[] = []
  paragraphs.forEach((para, i) => {
    const wrapped = c.doc.splitTextToSize(para, textW) as string[]
    allLines.push(...wrapped)
    if (i < paragraphs.length - 1) allLines.push('')
  })

  let remaining = [...allLines]
  while (remaining.length > 0) {
    const availH = c.pageH - c.y - 50
    const lineH = 9.5
    const maxLines = Math.max(3, Math.floor((availH - pad * 2) / lineH))
    const chunk = remaining.splice(0, maxLines)
    const boxH = chunk.length * lineH + pad * 2

    c.doc.setFillColor(...GRAY_50)
    c.doc.setDrawColor(...GRAY_200)
    c.doc.setLineWidth(0.5)
    c.doc.roundedRect(c.M, c.y, c.CW, boxH, 3, 3, 'FD')

    c.doc.setFont('helvetica', 'normal')
    c.doc.setFontSize(7.5)
    c.doc.setTextColor(...GRAY_600)
    chunk.forEach((ln, i) => { if (ln) c.doc.text(ln, c.M + pad, c.y + pad + 7 + i * lineH) })

    c.y += boxH + 6
    if (remaining.length > 0) addNewPage(c)
  }
}

// ── Info notice block (amber) ─────────────────────────────────────────────────
function noticeBlock(c: Ctx, lines: string[]): void {
  const pad = 8
  const textW = c.CW - pad * 2 - 16
  const wrapped: string[] = []
  lines.forEach((ln, i) => {
    const w = c.doc.splitTextToSize(ln, textW) as string[]
    wrapped.push(...w)
    if (i < lines.length - 1) wrapped.push('')
  })
  const boxH = wrapped.length * 9.5 + pad * 2
  ensure(c, boxH + 6)

  c.doc.setFillColor(...AMBER_50)
  c.doc.setDrawColor(253, 230, 138)
  c.doc.setLineWidth(0.5)
  c.doc.roundedRect(c.M, c.y, c.CW, boxH, 3, 3, 'FD')

  c.doc.setFont('helvetica', 'normal')
  c.doc.setFontSize(7.5)
  c.doc.setTextColor(...AMBER_700)
  wrapped.forEach((ln, i) => { if (ln) c.doc.text(ln, c.M + pad, c.y + pad + 7 + i * 9.5) })
  c.y += boxH + 8
}

// ── Fee summary (sales report) ────────────────────────────────────────────────
function feeSummary(c: Ctx, improvementFee: string, percentageRentDue: string, totalDue: string, grossSales: string, pctRate: string): void {
  const boxH = pctRate && parseFloat(pctRate) > 0 ? 82 : 60
  ensure(c, boxH + 6)

  c.doc.setFillColor(...AMBER_50)
  c.doc.setDrawColor(253, 230, 138)
  c.doc.setLineWidth(0.5)
  c.doc.roundedRect(c.M, c.y, c.CW, boxH, 3, 3, 'FD')

  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(7)
  c.doc.setTextColor(...AMBER_700)
  c.doc.text('FEE SUMMARY', c.M + 8, c.y + 13)

  let row = c.y + 26
  const gross = parseFloat(grossSales?.replace(/,/g, '') || '0') || 0
  const pct = parseFloat(pctRate || '0') || 0

  // Row: Improvement Fee
  c.doc.setFont('helvetica', 'normal')
  c.doc.setFontSize(8.5)
  c.doc.setTextColor(...GRAY_700)
  c.doc.text('Improvement Fee (2% of gross sales)', c.M + 8, row)
  c.doc.setFont('helvetica', 'bold')
  c.doc.setTextColor(...BLACK)
  c.doc.text(`$${improvementFee}`, c.M + c.CW - 8, row, { align: 'right' })
  row += 14

  if (pct > 0) {
    c.doc.setFont('helvetica', 'normal')
    c.doc.setTextColor(...GRAY_700)
    c.doc.text(`Percentage Rent (${pct}% of gross sales)`, c.M + 8, row)
    c.doc.setFont('helvetica', 'bold')
    c.doc.setTextColor(...BLACK)
    c.doc.text(`$${percentageRentDue}`, c.M + c.CW - 8, row, { align: 'right' })
    row += 14
  }

  // Divider + total
  c.doc.setDrawColor(253, 230, 138)
  c.doc.line(c.M + 8, row - 5, c.M + c.CW - 8, row - 5)
  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(10)
  c.doc.setTextColor(...AMBER_700)
  c.doc.text('Total Due for Period', c.M + 8, row + 4)
  c.doc.setFontSize(12)
  c.doc.text(`$${totalDue}`, c.M + c.CW - 8, row + 4, { align: 'right' })

  c.y += boxH + 8
}

// ── Per-form renderers ────────────────────────────────────────────────────────
function renderKeyRequest(c: Ctx, fd: Record<string, unknown>): void {
  sectionHead(c, 'Key Holder Information')
  fullField(c, 'Company', fd.company as string)
  fields(c, [{ label: 'Key Holder First Name', value: fd.firstName as string }, { label: 'Key Holder Last Name', value: fd.lastName as string }])
  fields(c, [{ label: 'Phone Number', value: fd.phone as string }, { label: 'E-Mail Address', value: fd.email as string }])
  fields(c, [{ label: 'Key Qty / Card #', value: fd.keyQtyCardNumber as string }, { label: 'Authorized By', value: fd.authorizedBy as string }])
  fields(c, [
    { label: 'Card Activation Date / Time', value: fd.activationDateTime as string },
    { label: 'Card De-activation Date / Time (optional)', value: (fd.deactivationDateTime as string) || null },
  ])

  gap(c, 4)
  sectionHead(c, 'Key / Card Type  (select all that apply)')
  checkboxGroup(c, KEY_CARD_TYPE_OPTIONS, (fd.keyCardTypes as string[]) ?? [])

  gap(c, 6)
  sectionHead(c, 'Company Type  (select one)')
  radioGroup(c, COMPANY_TYPE_OPTIONS, fd.companyType as string, 2)

  if (fd.companyType === 'Fitness Center Access') {
    gap(c, 4)
    ensure(c, 14)
    c.doc.setFont('helvetica', 'normal')
    c.doc.setFontSize(7.5)
    c.doc.setTextColor(...GRAY_400)
    c.doc.text('Select locker room access:', c.M + 14, c.y + 8)
    c.y += 14
    checkboxGroup(c, FITNESS_ROOM_OPTIONS, (fd.fitnessRooms as string[]) ?? [])
  }

  gap(c, 6)
  sectionHead(c, 'Conditions')
  policyBlock(c, KEY_CONDITIONS)
  checkItem(c, fd.agreeConditions === true, 'I have read and agree to the above conditions.')

  gap(c, 6)
  sectionHead(c, 'Signature')
  fields(c, [
    { label: 'Key / Card Holder Signature', value: fd.signature as string },
    { label: 'Date', value: fd.signatureDate as string },
  ])
}

function renderFitnessWaiver(c: Ctx, fd: Record<string, unknown>): void {
  sectionHead(c, 'Waiver Text')
  policyBlock(c, FITNESS_WAIVER_TEXT.split('\n\n').filter(Boolean))

  gap(c, 4)
  sectionHead(c, 'User Information')
  fullField(c, "User's Name", fd.fullName as string)
  fields(c, [{ label: 'Employer', value: fd.employer as string }, { label: 'Badge Number', value: fd.badgeNumber as string }])

  gap(c, 6)
  sectionHead(c, 'Agreement & Signature')
  checkItem(c, fd.agreeWaiver === true, 'I have read and agree to the above Fitness Center Waiver, Release, and Indemnification.')
  gap(c, 6)
  fields(c, [
    { label: "User's Signature", value: fd.signature as string },
    { label: 'Date', value: fd.date as string },
  ])
}

function renderPetRegistration(c: Ctx, fd: Record<string, unknown>): void {
  sectionHead(c, 'Dairy Block Pet Policy')
  policyBlock(c, PET_POLICY_PARAGRAPHS)

  gap(c, 4)
  sectionHead(c, 'Tenant Information')
  fields(c, [{ label: 'Tenant Name', value: fd.tenantName as string }, { label: 'Unit / Suite Number', value: fd.suite as string }])

  gap(c, 4)
  sectionHead(c, 'Pet Information')
  const species = fd.species as string
  const speciesDisplay = species === 'Other' && fd.speciesOther ? `${species} — ${fd.speciesOther}` : species
  fields(c, [{ label: 'Pet Name', value: fd.petName as string }, { label: 'Species', value: speciesDisplay }])
  fields(c, [{ label: 'Breed', value: fd.breed as string }, { label: 'Weight (lbs)', value: fd.weight as string }])
  fullField(c, 'Color / Markings', fd.colorMarkings as string)

  gap(c, 4)
  sectionHead(c, 'Veterinarian Information')
  fields(c, [{ label: 'Veterinarian Name', value: fd.vetName as string }, { label: 'Veterinarian Phone', value: fd.vetPhone as string }])
  gap(c, 4)
  ensure(c, 22)
  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(7)
  c.doc.setTextColor(...GRAY_400)
  c.doc.text('ARE VACCINATIONS UP TO DATE?', c.M, c.y)
  c.y += 10
  radioGroup(c, ['Yes', 'No'], fd.vaccinated as string, 2)

  gap(c, 4)
  sectionHead(c, 'Policy Agreement')
  checkItem(c, fd.agreePetPolicy === true, 'I have read and agree to the Dairy Block Pet Policy. I understand that the pet owner and the company I work for are completely and solely liable for any injuries or damage caused by my pet, and that violation of this policy will void my right to bring my pet on-site.')
}

function renderEmergencyCoordinator(c: Ctx, fd: Record<string, unknown>): void {
  noticeBlock(c, [
    'Designate one Emergency Coordinator per every 20 on-site staff members.',
    'The alternate coordinator steps in if the primary is absent during an emergency or evacuation.',
  ])

  sectionHead(c, 'Company Information')
  fullField(c, 'Company Name', fd.companyName as string)
  fields(c, [{ label: 'Floor / Suite Number', value: fd.floorSuite as string }, { label: 'Number of Employees Occupying Your Space', value: fd.numEmployees as string }])

  gap(c, 6)
  sectionHead(c, 'Primary Emergency Coordinator')
  const prim = (fd.primary ?? {}) as Record<string, string>
  fields(c, [{ label: 'Name', value: prim.name }, { label: 'Title / Position', value: prim.title }])
  fields(c, [{ label: 'Cell Phone', value: prim.cellPhone }, { label: 'Work Phone', value: prim.workPhone }])
  fullField(c, 'Email', prim.email)

  gap(c, 6)
  sectionHead(c, 'Alternate Emergency Coordinator')
  const alt = (fd.alternate ?? {}) as Record<string, string>
  fields(c, [{ label: 'Name', value: alt.name }, { label: 'Title / Position', value: alt.title }])
  fields(c, [{ label: 'Cell Phone', value: alt.cellPhone }, { label: 'Work Phone', value: alt.workPhone }])
  fullField(c, 'Email', alt.email)

  gap(c, 6)
  sectionHead(c, 'Special Needs / Mobility Issues on Floor (optional)')
  textareaField(c, 'List individuals who may require evacuation assistance, including their detailed work location', fd.specialNeeds as string)
}

function renderHandbookAcknowledgement(c: Ctx, fd: Record<string, unknown>): void {
  sectionHead(c, 'Employee Information')
  fullField(c, 'Full Name', fd.fullName as string)
  fields(c, [{ label: 'Title / Position', value: fd.title as string }, { label: 'Company', value: fd.company as string }])
  fields(c, [{ label: 'Unit / Suite', value: fd.suite as string }, { label: 'Handbook Type', value: fd.handbookType as string }])

  gap(c, 6)
  sectionHead(c, 'Acknowledgements')
  const handbookLabel = (fd.handbookType as string) === 'Retail' ? 'Dairy Block Retail Tenant Handbook' : 'Dairy Block Office Tenant Handbook'
  checkItem(c, fd.agreeReceived === true, `I acknowledge that I have received, read, and understand the policies and procedures outlined in the ${handbookLabel}.`)
  gap(c, 4)
  checkItem(c, fd.agreeAbide === true, `I agree to abide by all policies outlined in the ${handbookLabel} and will communicate these procedures to my employees, contractors, and visitors as appropriate.`)

  gap(c, 6)
  sectionHead(c, 'Signature')
  fields(c, [{ label: 'Digital Signature', value: fd.signature as string }, { label: 'Date', value: fd.date as string }])
}

function renderSalesReport(c: Ctx, fd: Record<string, unknown>): void {
  noticeBlock(c, ['Monthly sales reports are due by the 5th of each month.', 'The 2% improvement fee is calculated based on gross sales.'])

  sectionHead(c, 'Tenant Information')
  fullField(c, 'Tenant Company', fd.businessName as string)
  fields(c, [{ label: 'First Name', value: fd.firstName as string }, { label: 'Last Name', value: fd.lastName as string }])
  fields(c, [{ label: 'Phone Number', value: fd.phone as string }, { label: 'E-Mail Address', value: fd.email as string }])
  fields(c, [{ label: 'Suite Number', value: fd.suite as string }, { label: 'Sales Reporting Period', value: fd.reportingMonth as string }])

  gap(c, 6)
  sectionHead(c, 'Sales Figures')
  fields(c, [
    { label: 'Total Gross Sales ($)', value: fd.grossSales ? `$${fd.grossSales}` : null },
    { label: 'Percentage Rent Rate (%) — from lease, if applicable', value: fd.percentageRentRate ? `${fd.percentageRentRate}%` : null },
  ])

  if (fd.improvementFee || fd.totalDue) {
    gap(c, 4)
    feeSummary(
      c,
      fd.improvementFee as string || '0.00',
      fd.percentageRentDue as string || '0.00',
      fd.totalDue as string || '0.00',
      fd.grossSales as string || '0',
      fd.percentageRentRate as string || '0',
    )
  }

  gap(c, 2)
  sectionHead(c, 'Supporting Financial Report')
  fullField(c, 'Uploaded File', fd.supportingReportName as string || 'No file uploaded')

  gap(c, 2)
  sectionHead(c, 'Notes / Comments')
  textareaField(c, 'Notes', fd.notes as string || null)
}

// ── Document header (page 1) ──────────────────────────────────────────────────
function renderDocHeader(c: Ctx, data: PDFSubmissionData): void {
  const { doc, M, pageW } = c
  const formLabel = FORM_TYPE_LABELS[data.type] ?? data.type
  const sc = STATUS_COLORS[data.status] ?? STATUS_COLORS.SUBMITTED
  const statusLabel = FORM_STATUS_LABELS[data.status] ?? data.status

  // Teal brand bar
  doc.setFillColor(...TEAL)
  doc.rect(0, 0, pageW, 56, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text('DAIRY BLOCK', M, 26)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(232, 242, 236)
  doc.text('Tenant Hub', M, 40)
  doc.setFontSize(7.5)
  doc.setTextColor(...MINT)
  doc.text('dairy-block-hub.vercel.app', pageW - M, 35, { align: 'right' })

  c.y = 68

  // Form title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...BLACK)
  doc.text(formLabel, M, c.y)

  // Status badge
  const badgeW = Math.max(68, doc.getStringUnitWidth(statusLabel) * 8 + 22)
  const bx = pageW - M - badgeW
  doc.setFillColor(...sc.bg)
  doc.roundedRect(bx, c.y - 14, badgeW, 19, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...sc.text)
  doc.text(statusLabel, bx + badgeW / 2, c.y - 3, { align: 'center' })

  c.y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY_400)
  doc.text(`Ref: ${data.refNumber}   ·   Submitted: ${fmtDateTime(data.createdAt)}`, M, c.y)
  c.y += 12

  doc.setDrawColor(...MINT)
  doc.setLineWidth(0.75)
  doc.line(M, c.y, pageW - M, c.y)
  c.y += 10

  // Submitted by
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY_400)
  doc.text('SUBMITTED BY', M, c.y)
  c.y += 11
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BLACK)
  doc.text(data.submittedBy.name, M, c.y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY_700)
  const nw = doc.getStringUnitWidth(data.submittedBy.name) * 10
  doc.text(`  ·  ${data.submittedBy.email}`, M + nw, c.y)
  c.y += 12
  const meta: string[] = []
  if (data.submittedBy.tenantInfo?.unit)    meta.push(`Unit ${data.submittedBy.tenantInfo.unit}`)
  if (data.submittedBy.tenantInfo?.company) meta.push(data.submittedBy.tenantInfo.company)
  if (meta.length > 0) {
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY_400)
    doc.text(meta.join(' · '), M, c.y)
    c.y += 12
  }
  c.y += 6

  doc.setDrawColor(...MINT)
  doc.setLineWidth(0.5)
  doc.line(M, c.y, pageW - M, c.y)
  c.y += 14
}

// ── Admin notes ───────────────────────────────────────────────────────────────
function renderAdminNotes(c: Ctx, data: PDFSubmissionData): void {
  if (!data.adminNotes) return
  gap(c, 6)
  divider(c)
  sectionHead(c, 'Admin Notes')

  const noteLines = c.doc.splitTextToSize(data.adminNotes, c.CW - 24) as string[]
  const boxH = noteLines.length * 12 + 20
  ensure(c, boxH + 6)

  c.doc.setFillColor(...MINT_LIGHT)
  c.doc.rect(c.M, c.y, c.CW, boxH, 'F')
  c.doc.setFillColor(...TEAL)
  c.doc.rect(c.M, c.y, 3, boxH, 'F')

  c.y += 10
  c.doc.setFont('helvetica', 'normal')
  c.doc.setFontSize(9)
  c.doc.setTextColor(...GRAY_700)
  noteLines.forEach((ln) => { c.doc.text(ln, c.M + 10, c.y); c.y += 12 })

  if (data.reviewedBy) {
    c.doc.setFontSize(7.5)
    c.doc.setFont('helvetica', 'italic')
    c.doc.setTextColor(...GRAY_400)
    c.y += 2
    c.doc.text(`Reviewed by ${data.reviewedBy.name}`, c.M + 10, c.y)
    c.y += 12
  } else {
    c.y += 10
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────
function renderFooter(c: Ctx): void {
  // Draw on every existing page
  const total = c.doc.internal.pages.length - 1
  for (let p = 1; p <= total; p++) {
    c.doc.setPage(p)
    const fy = c.pageH - 26
    c.doc.setDrawColor(...MINT)
    c.doc.setLineWidth(0.5)
    c.doc.line(c.M, fy - 8, c.pageW - c.M, fy - 8)
    c.doc.setFont('helvetica', 'normal')
    c.doc.setFontSize(7)
    c.doc.setTextColor(...GRAY_400)
    c.doc.text('Dairy Block · 1800 Wazee Street, Suite 100, Denver, CO 80202', c.M, fy)
    c.doc.text(
      `Page ${p} of ${total}   ·   Downloaded ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      c.pageW - c.M, fy, { align: 'right' },
    )
  }
}

// ── Date formatter ────────────────────────────────────────────────────────────
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function generateFormSubmissionPDF(data: PDFSubmissionData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const formLabel = FORM_TYPE_LABELS[data.type] ?? data.type
  const c = mkCtx(doc, formLabel, data.refNumber)

  renderDocHeader(c, data)

  const fd = data.formData
  switch (data.type) {
    case 'KEY_REQUEST':              renderKeyRequest(c, fd);              break
    case 'FITNESS_WAIVER':           renderFitnessWaiver(c, fd);           break
    case 'PET_REGISTRATION':         renderPetRegistration(c, fd);         break
    case 'EMERGENCY_COORDINATOR':    renderEmergencyCoordinator(c, fd);    break
    case 'HANDBOOK_ACKNOWLEDGEMENT': renderHandbookAcknowledgement(c, fd); break
    case 'RETAIL_SALES_REPORT':      renderSalesReport(c, fd);             break
    default: {
      // Fallback: generic key-value table
      const rows = Object.entries(fd)
        .filter(([k]) => k !== 'supportingReportData')
        .map(([k, v]) => [k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(), String(v ?? '—')])
      autoTable(doc, {
        startY: c.y, margin: { left: c.M, right: c.M }, head: [],
        body: rows as [string, string][],
        styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 8, right: 8 }, lineColor: [229, 231, 235], lineWidth: 0.5 },
        columnStyles: { 0: { cellWidth: 170, fontStyle: 'bold', textColor: GRAY_700, fillColor: GRAY_50 }, 1: { textColor: BLACK } },
      })
    }
  }

  renderAdminNotes(c, data)
  renderFooter(c)

  doc.save(`${data.refNumber}.pdf`)
}
