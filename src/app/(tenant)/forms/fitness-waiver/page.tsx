'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormData {
  fullName: string
  employer: string
  badgeNumber: string
  agreeWaiver: boolean
  signature: string
  date: string
}

const WAIVER_TEXT = `FITNESS CENTER WAIVER, RELEASE, AND INDEMNIFICATION

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

This Waiver shall be governed by the laws of the state of Colorado.

The User intending to be legally bound has caused this Waiver to be executed on the date referenced below.`

export default function FitnessWaiverForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState<FormData>({
    fullName: '',
    employer: '',
    badgeNumber: '',
    agreeWaiver: false,
    signature: '',
    date: today,
  })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [error, setError]         = useState('')

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.agreeWaiver) {
      setError('You must read and agree to the waiver before submitting.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fitness-waiver', formData: form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setRefNumber(json.refNumber ?? `FW-${Date.now().toString(36).toUpperCase()}`)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <div className="db-card p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-blue-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-db-black">Waiver Submitted!</h2>
          <p className="text-db-gray-500 text-sm">Your fitness center waiver has been submitted. Property Management will process your access request shortly.</p>
          <div className="bg-db-gray-50 rounded-xl px-5 py-3 inline-block">
            <p className="text-xs text-db-gray-400">Reference Number</p>
            <p className="text-lg font-bold text-db-black font-mono">{refNumber}</p>
          </div>
          <div className="pt-2 flex gap-3 justify-center">
            <Link href="/forms" className="btn-ghost">Back to Forms</Link>
            <Link href="/dashboard" className="btn-teal">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link href="/forms" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Forms
      </Link>

      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Dumbbell size={18} className="text-blue-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-db-black">Fitness Center Waiver, Release, and Indemnification</h1>
        </div>
        <p className="text-db-gray-400 text-sm ml-12">Required to gain access to the Dairy Block Fitness Center (2nd floor, 1825 Blake St). Please read the full waiver below before signing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Waiver Text */}
        <div>
          <div className="h-80 overflow-y-auto rounded-xl border border-db-gray-200 bg-db-gray-50 p-4 text-xs text-db-gray-600 leading-relaxed whitespace-pre-wrap font-mono">
            {WAIVER_TEXT}
          </div>
          <a
            href="/docs/Dairy Block Fitness Center Guidelines.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs text-db-teal hover:underline"
          >
            <ExternalLink size={12} /> View Fitness Center Guidelines
          </a>
        </div>

        {/* User details */}
        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">User&apos;s Name</label>
          <input
            required
            value={form.fullName}
            onChange={e => update('fullName', e.target.value)}
            className="db-input"
            placeholder="Full legal name"
          />
        </div>

        {/* Agreement checkbox */}
        <div className="p-4 bg-db-gray-50 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeWaiver}
              onChange={e => update('agreeWaiver', e.target.checked)}
              className="mt-0.5 rounded border-db-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-db-gray-600">I have read and agree to the above Fitness Center Waiver, Release, and Indemnification.</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">User&apos;s Signature</label>
          <input
            required
            value={form.signature}
            onChange={e => update('signature', e.target.value)}
            className="db-input"
            placeholder="Type your full legal name as your electronic signature"
          />
          <p className="text-xs text-db-gray-400 mt-1">By typing your name above, you agree this serves as your electronic signature.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-db-black mb-1.5">Date</label>
          <input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="db-input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Employer</label>
            <input
              required
              value={form.employer}
              onChange={e => update('employer', e.target.value)}
              className="db-input"
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-db-black mb-1.5">Badge Number</label>
            <input
              required
              value={form.badgeNumber}
              onChange={e => update('badgeNumber', e.target.value)}
              className="db-input"
              placeholder="Access badge #"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle size={15} className="text-db-red flex-shrink-0" />
            <p className="text-xs text-db-red">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/forms" className="btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className={cn('btn-teal flex-1', loading && 'opacity-70')}>
            {loading ? 'Submitting…' : 'Submit Waiver'}
          </button>
        </div>
      </form>

      {/* Standalone guidelines link */}
      <div className="mt-6 pt-6 border-t border-db-gray-100">
        <a
          href="/docs/Dairy Block Fitness Center Guidelines.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-db-teal hover:text-db-teal-dark transition-colors"
        >
          <ExternalLink size={14} />
          View Fitness Center Guidelines (PDF)
        </a>
      </div>
    </div>
  )
}
