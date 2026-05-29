import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode, ElementType } from 'react'
import {
  ArrowLeft, Phone, Mail, Clock, DollarSign, MapPin,
  AlertTriangle, Users, Dumbbell, Car, Trash2, Zap,
  Thermometer, Droplets, Package, Shield, BookOpen,
} from 'lucide-react'

function Section({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-db-gray-100">
        <div className="w-9 h-9 rounded-xl bg-db-mint-light flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-db-teal" />
        </div>
        <h2 className="font-display text-xl font-bold text-db-black">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function InfoCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`db-card p-4 ${className}`}>{children}</div>
  )
}

function FeeRow({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-db-gray-50 last:border-0">
      <span className="text-sm text-db-gray-600">{label}</span>
      <span className="text-sm font-semibold text-db-black bg-db-mint-light px-2.5 py-0.5 rounded-lg">{amount}</span>
    </div>
  )
}

export default async function OfficeHandbookPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-8">
      <Link href="/handbook" className="inline-flex items-center gap-1.5 text-sm text-db-gray-400 hover:text-db-black transition-colors">
        <ArrowLeft size={15} /> Back to Handbook
      </Link>

      {/* Title Banner */}
      <div className="db-card p-8 bg-gradient-to-br from-db-black to-[#2a2a2a]">
        <p className="text-db-mint text-xs font-semibold tracking-widest uppercase mb-2">Dairy Block Denver</p>
        <h1 className="font-display text-3xl font-bold text-white">Office Tenant Handbook</h1>
        <p className="text-white/50 text-sm mt-2">Your guide to building policies, procedures, and resources.</p>
        <p className="text-white/30 text-xs mt-4">1800 Wazee Street, Suite 200 · Denver, CO 80202</p>
      </div>

      {/* Welcome */}
      <InfoCard>
        <p className="text-sm text-db-gray-600 leading-relaxed">
          Welcome to Dairy Block! Located in Denver's Historic LoDo District, Dairy Block is a vibrant, walkable micro-district in the heart of Lower Downtown Denver. Celebrating the Front Range's most inspiring retailers and food and beverage offerings with an urban office alongside The Maven Hotel, Dairy Block provides an attractive environment to enjoy for both work and play.
        </p>
        <p className="text-sm text-db-gray-600 leading-relaxed mt-3">
          The Property Management Team is committed to providing fabled service and an unmatched experience to our customers. We hope this handbook is a useful guide to help tenants understand the day-to-day operations of the property — please don't hesitate to reach out with questions.
        </p>
      </InfoCard>

      {/* Important Contacts */}
      <Section title="Important Contact Information" icon={Users}>
        <p className="text-sm text-db-gray-500">Our preferred method of contact is via email. Reach out to <span className="text-db-teal font-medium">pm@dairyblock.com</span> and your message will be distributed to the Property Management, Operations & Security teams.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PM Team */}
          <InfoCard>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Property Management</p>
            <div className="space-y-2.5">
              {[
                { name: 'Scott Vollmer', title: 'General Manager',            email: 'scott.vollmer@mcwhinney.com'      },
                { name: 'Tiffany Frederiksen', title: 'Senior Property Manager', email: 'tiffany.frederiksen@mcwhinney.com' },
                { name: 'Liam Walsh',    title: 'Property Manager',           email: 'liam.walsh@mcwhinney.com'         },
                { name: 'Ashley Sinclair', title: 'Senior Property Administrator', email: 'ashley.sinclair@mcwhinney.com' },
                { name: 'Nate Couture',  title: 'Marketing Manager',          email: 'nate.couture@mcwhinney.com'       },
                { name: 'Mary Siegwalt', title: 'Marketing Coordinator',      email: 'mary.siegwalt@mcwhinney.com'      },
              ].map(({ name, title, email }) => (
                <div key={name}>
                  <p className="text-sm font-medium text-db-black">{name}</p>
                  <p className="text-xs text-db-gray-400">{title}</p>
                  <p className="text-xs text-db-teal">{email}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-db-gray-100 flex items-center gap-2">
              <Mail size={13} className="text-db-teal" />
              <span className="text-xs text-db-teal font-medium">pm@dairyblock.com</span>
            </div>
          </InfoCard>

          <div className="space-y-3">
            {/* Security */}
            <InfoCard>
              <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Security Desk (24/7)</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><Phone size={13} className="text-db-teal" /><span className="text-sm text-db-black">Desk: (303) 297-3312</span></div>
                <div className="flex items-center gap-2"><Phone size={13} className="text-db-teal" /><span className="text-sm text-db-black">Mobile: (303) 249-0178</span></div>
                <div className="flex items-center gap-2"><Mail size={13} className="text-db-teal" /><span className="text-sm text-db-black">security@dairyblock.com</span></div>
              </div>
              <div className="mt-2 pt-2 border-t border-db-gray-100">
                <p className="text-xs text-db-gray-500">Josh Boyles — Safety Operations Manager</p>
                <p className="text-xs text-db-gray-500">Marjhonna Brown — Site Supervisor</p>
              </div>
            </InfoCard>

            {/* After-hours Maintenance */}
            <InfoCard>
              <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">After-Hours Maintenance</p>
              <div className="flex items-center gap-2"><Phone size={13} className="text-db-teal" /><span className="text-sm text-db-black">(303) 249-0178</span></div>
              <div className="flex items-center gap-2 mt-1"><Phone size={13} className="text-db-teal" /><span className="text-sm text-db-black">(970) 962-0011</span></div>
              <p className="text-xs text-db-gray-400 mt-2">Rick Agema, Reid Maddux, Marlon Velasquez</p>
            </InfoCard>

            {/* Parking */}
            <InfoCard>
              <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Parking (LAZ)</p>
              <div className="flex items-center gap-2"><Phone size={13} className="text-db-teal" /><span className="text-sm text-db-black">(303) 291-1111</span></div>
              <a href="https://parkdairyblock.com" target="_blank" rel="noopener noreferrer" className="text-xs text-db-teal mt-1 block">parkdairyblock.com</a>
            </InfoCard>
          </div>
        </div>

        <div className="p-3.5 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
          <AlertTriangle size={15} className="text-db-red flex-shrink-0 mt-0.5" />
          <p className="text-xs text-db-red font-medium">If there is a life safety issue, call 911 first.</p>
        </div>
      </Section>

      {/* Building Access & Hours */}
      <Section title="Building Access & Hours" icon={Clock}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Regular Hours</p>
            <div className="space-y-2">
              {[
                { day: 'Monday – Friday', hours: '7:00 AM – 9:00 PM' },
                { day: 'Saturday',        hours: '9:00 AM – 1:00 PM' },
                { day: 'Sunday / Holidays', hours: 'Locked all day'  },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-db-gray-500">{day}</span>
                  <span className="font-medium text-db-black">{hours}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-db-gray-400 mt-3 pt-3 border-t border-db-gray-100">Security Desk is open 24/7</p>
          </InfoCard>
          <InfoCard>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Observed Holidays</p>
            <ul className="text-sm text-db-gray-600 space-y-1">
              {['New Year\'s Day','Memorial Day','Juneteenth','Independence Day','Labor Day','Thanksgiving Day','Christmas Day'].map(h => (
                <li key={h} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-db-teal flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </InfoCard>
        </div>
        <InfoCard>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Keys & Access Cards</p>
          <p className="text-sm text-db-gray-600 leading-relaxed">To assign an access card or key to employees, complete the Key Issuance form and return it to Property Management at pm@dairyblock.com. Allow <strong>72 hours</strong> for requests to be processed.</p>
          <p className="text-sm text-db-gray-600 mt-2">No keys may be duplicated and no locks may be changed without prior written consent from Property Management. Tenants should recapture and return all keys and access cards upon moving out.</p>
          <div className="mt-3">
            <Link href="/forms/key-request" className="text-sm font-semibold text-db-teal hover:underline">Submit a Key/Card Request →</Link>
          </div>
        </InfoCard>
      </Section>

      {/* Maintenance Fees */}
      <Section title="Fees & Charges" icon={DollarSign}>
        <InfoCard>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Standard Fees</p>
          <FeeRow label="Replacement Access Card"         amount="$25.00 (or per Lease)" />
          <FeeRow label="Additional Door Keys"            amount="$50.00 + re-keying costs" />
          <FeeRow label="Hourly Technician Labor"         amount="$83.68 / hour" />
          <FeeRow label="Overtime Technician Labor"       amount="$105.02 / hour" />
          <FeeRow label="After-Hours HVAC"                amount="$150.00 / hour (or per Lease)" />
          <FeeRow label="After-Hours Elevator Programming" amount="$50.00 / occurrence" />
        </InfoCard>
      </Section>

      {/* Rent Payments */}
      <Section title="Rent Payments" icon={DollarSign}>
        <InfoCard>
          <p className="text-sm text-db-gray-600 leading-relaxed">Rent and tenant charges are due and payable on the <strong>first day of each month</strong> in accordance with the terms of the Lease Agreement. All tenants are strongly encouraged to sign up for automated electronic payments via <strong>Yardi Commercial Café</strong>.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-db-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-db-gray-500 mb-1">Firehouse Block Tenants</p>
              <p className="text-xs text-db-gray-500">1801, 1805, 1809, 1821, 1855 Blake Street</p>
              <p className="text-xs text-db-black font-medium mt-1">Payable to: Firehouse Block, LLC</p>
            </div>
            <div className="bg-db-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-db-gray-500 mb-1">Block 22O Tenants</p>
              <p className="text-xs text-db-gray-500">1800 Wazee & 1825 Blake Street</p>
              <p className="text-xs text-db-black font-medium mt-1">Payable to: BLK22O, LLC</p>
            </div>
          </div>
          <p className="text-xs text-db-gray-400 mt-3">c/o Property Management · 1800 Wazee Street, Suite 200 · Denver, CO 80202</p>
        </InfoCard>
      </Section>

      {/* Moving In & Out */}
      <Section title="Moving In & Out" icon={Package}>
        <InfoCard>
          <p className="text-sm text-db-gray-600 leading-relaxed mb-3">Schedule moves with Property Management <strong>at least two weeks in advance</strong>. Moves and deliveries which require multiple trips are not allowed during peak business hours of Monday–Friday 8:00 AM – 5:00 PM.</p>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Moving Checklist</p>
          <ul className="text-sm text-db-gray-600 space-y-1.5">
            {[
              'Schedule a pre-move walkthrough with Property Management',
              'Contact telephone and cable companies to connect/discontinue service',
              'Coordinate the assignment or collection of keys/access cards',
              'Provide the U.S. Post Office with a change of address',
              'Provide Property Management with a list of all moving vendors',
              'All vendors must provide an approved Certificate of Insurance before working onsite',
              'Place floor and wall protection in elevators and along tight corners',
              'Remove all protection materials and trash after the move',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-db-teal flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </InfoCard>
      </Section>

      {/* Parking */}
      <Section title="Parking" icon={Car}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">LAZ Parking Garage</p>
            <div className="flex items-center gap-1.5"><Phone size={12} className="text-db-teal" /><span className="text-sm text-db-black">(303) 291-1111</span></div>
            <a href="https://parkdairyblock.com" target="_blank" rel="noopener noreferrer" className="text-xs text-db-teal mt-1 block">parkdairyblock.com</a>
            <p className="text-xs text-db-gray-500 mt-2">Entrance on 19th St between Blake & Wazee. 7 ft clearance. Work trucks park on east side of Level B1 (8 ft 4 in).</p>
          </InfoCard>
          <InfoCard>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Valet (Parkwell)</p>
            <p className="text-xs text-db-gray-500 mb-1">1850 Wazee St — Maven Hotel entrance</p>
            <div className="flex items-center gap-1.5"><Phone size={12} className="text-db-teal" /><span className="text-sm text-db-black">720-504-3620</span></div>
            <a href="https://goparkwell.com" target="_blank" rel="noopener noreferrer" className="text-xs text-db-teal mt-1 block">goparkwell.com</a>
          </InfoCard>
          <InfoCard>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Emergency Towing</p>
            <p className="text-xs text-db-gray-500 mb-1">Ace Towing Enterprise</p>
            <div className="flex items-center gap-1.5"><Phone size={12} className="text-db-teal" /><span className="text-sm text-db-black">(303) 980-8770</span></div>
            <p className="text-xs text-db-gray-400 mt-1">Dead battery, no gas, or locate towed vehicle</p>
          </InfoCard>
        </div>
      </Section>

      {/* Fitness Center */}
      <Section title="Dairy Block Fitness Center" icon={Dumbbell}>
        <InfoCard>
          <div className="flex items-start gap-3 mb-4">
            <MapPin size={15} className="text-db-teal flex-shrink-0 mt-0.5" />
            <p className="text-sm text-db-gray-600">2nd floor of 1825 Blake Street — featuring state-of-the-art equipment, locker rooms, and yoga studio. Available to Dairy Block office tenants and guests of The Maven Hotel.</p>
          </div>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Guidelines</p>
          <ul className="text-sm text-db-gray-600 space-y-1.5">
            {[
              'No guests — office tenants and hotel guests only',
              'Users under 16 must be accompanied by an adult',
              'No food or beverages other than water bottles',
              'Appropriate exercise attire required — socks and shirts at all times; no open-toed shoes',
              'Use safety devices to secure weights; use spotters when lifting maximum weights',
              'Do not drop weights; return all equipment to proper racks after use',
              'Lockers are day-use only — do not leave belongings overnight',
              'Wipe down equipment after use',
              'Consult a physician prior to starting an exercise program',
              'Use of the Fitness Center is at your own risk',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-db-teal flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-db-gray-100">
            <Link href="/forms/fitness-waiver" className="text-sm font-semibold text-db-teal hover:underline">Submit Fitness Center Waiver to Gain Access →</Link>
          </div>
        </InfoCard>
      </Section>

      {/* Janitorial */}
      <Section title="Janitorial Service" icon={Trash2}>
        <InfoCard>
          <p className="text-sm text-db-gray-600 leading-relaxed">Regular janitorial services throughout tenant suites are provided after <strong>5:00 PM Monday–Friday</strong> and are usually completed by 11:00 PM. Janitorial services are not provided on observed holidays.</p>
          <p className="text-sm text-db-gray-600 leading-relaxed mt-2">Report any janitorial issues directly to Property Management. Tenants are not authorized to perform or contract janitorial work without prior written consent.</p>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mt-4 mb-2">Recycling & Trash</p>
          <ul className="text-sm text-db-gray-600 space-y-1">
            {[
              'Recycling provided for office paper, cardboard, glass, plastic, and aluminum',
              'All cardboard boxes must be broken down and labeled "TRASH / RECYCLING"',
              'Small desk-side recycling bins should be emptied by each employee into central bins',
              'Toner cartridge and electronics recycling is the responsibility of each tenant',
              'No liquids in waste receptacles; place loose toner in a sealed plastic bag',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-db-teal flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </InfoCard>
      </Section>

      {/* Building Systems */}
      <Section title="Building Systems" icon={Zap}>
        <div className="space-y-3">
          <InfoCard>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer size={15} className="text-db-orange" />
              <p className="text-sm font-semibold text-db-black">Heating & Cooling</p>
            </div>
            <p className="text-sm text-db-gray-600">Industry standard temperature range is 68–74°F. Adjust thermostats by 2° increments. Space heaters are <strong>strictly prohibited</strong>. After-hours HVAC requires 72 hours advance notice and costs $150/hour.</p>
          </InfoCard>
          <InfoCard>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={15} className="text-db-marigold" />
              <p className="text-sm font-semibold text-db-black">Electrical & Cabling</p>
            </div>
            <p className="text-sm text-db-gray-600">Do not attempt to repair outlets or reset circuit breakers — contact Property Management. All electrical wiring alterations require prior approval. No boring, cutting, or stringing of wires without written consent.</p>
          </InfoCard>
          <InfoCard>
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={15} className="text-blue-500" />
              <p className="text-sm font-semibold text-db-black">Plumbing</p>
            </div>
            <p className="text-sm text-db-gray-600">Do not dispose of rubbish, rags, coffee grounds, or other foreign objects in plumbing fixtures. All damage from misuse is the tenant's responsibility.</p>
          </InfoCard>
        </div>
      </Section>

      {/* Emergency Precautions */}
      <Section title="Emergency Precautions" icon={AlertTriangle}>
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-sm font-semibold text-db-red mb-2">In the event of an emergency:</p>
          <ol className="text-sm text-db-red space-y-1">
            <li className="flex items-center gap-2"><span className="font-bold">1.</span> Call 911 immediately</li>
            <li className="flex items-center gap-2"><span className="font-bold">2.</span> Notify the Security Desk: (303) 249-0178</li>
            <li className="flex items-center gap-2"><span className="font-bold">3.</span> Contact Property Management: pm@dairyblock.com</li>
          </ol>
          <p className="text-xs text-db-red/70 mt-3">Refer to the Emergency Procedures Handbook for complete procedures. Consider filing your <Link href="/forms/emergency-coordinator" className="underline font-semibold">Emergency Coordinator Form</Link>.</p>
        </div>
      </Section>

      {/* Mail Delivery */}
      <Section title="Mail Delivery" icon={MapPin}>
        <InfoCard>
          <p className="text-sm text-db-gray-600 mb-3">Coordinate directly with the United States Postal Service to establish mail delivery for your business.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-db-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-db-gray-500 mb-1">BLK22O, LLC Tenants</p>
              <p className="text-sm text-db-black">1821 Blake – 1st floor main lobby</p>
            </div>
            <div className="bg-db-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-db-gray-500 mb-1">Firehouse Block, LLC Tenants</p>
              <p className="text-sm text-db-black">1800 Wazee – past the security desk, south of the elevator bank</p>
            </div>
          </div>
        </InfoCard>
      </Section>

      {/* Key Policies */}
      <Section title="Key Policies" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Alcohol & Drug Use', body: 'Property Management reserves the right to exclude any person who is intoxicated or under the influence of liquor or drugs, or acting in violation of the rules.' },
            { title: 'Firearms & Weapons', body: 'No explosives, firearms, or weapons of any kind may be brought onto the premises at any time.' },
            { title: 'Smoking & Vaping', body: 'Smoking and the use of vaporizers is prohibited anywhere on Dairy Block premises, including Dairy Block Alley and outdoor patios, and within 25 feet of any building entrance.' },
            { title: 'Space Heaters', body: 'Space heaters are strictly prohibited as they are a fire hazard.' },
            { title: 'Soliciting', body: 'Canvassing, soliciting and peddling are prohibited. Notify the Security Desk of any solicitors immediately.' },
            { title: 'Pets & Animals', body: 'Pets must be pre-approved in writing by Property Management. Submit a photo, vaccination records, and the Pet Registration form. All dogs must be leashed at all times.' },
          ].map(({ title, body }) => (
            <InfoCard key={title}>
              <p className="text-sm font-semibold text-db-black mb-1">{title}</p>
              <p className="text-sm text-db-gray-500">{body}</p>
            </InfoCard>
          ))}
        </div>
      </Section>

      {/* Dairy Block Alley */}
      <Section title="Dairy Block Alley" icon={BookOpen}>
        <InfoCard>
          <div className="space-y-3">
            {[
              { heading: 'Alcohol', body: 'Alcoholic beverages must be enjoyed within the establishment purchased, with the exception of Kachina and Poka Lola at The Maven Hotel. Drinks from other retailers require an approved Liquor License Modification.' },
              { heading: 'Artwork', body: 'Please enjoy the 700+ pieces of original art at Dairy Block. Vandalism, theft, or misuse should be reported to the Security Desk immediately.' },
              { heading: 'Bicycles', body: 'Bicyclists and skateboarders must dismount before entering Dairy Block Alley. Bikes may not be locked in the alley.' },
              { heading: 'Deliveries', body: 'Deliveries are not allowed through Dairy Block Alley without prior written consent. Delivery vehicles should park on the street in designated loading zones.' },
              { heading: 'Photography', body: 'Personal photos are welcome. Professional shoots must be coordinated with Property Management ($200 minimum/hour).' },
              { heading: 'Smoking', body: 'Smoking and vaporizers are not allowed in Dairy Block Alley, outdoor patios, or within 25 feet of any building entrance.' },
            ].map(({ heading, body }) => (
              <div key={heading} className="border-b border-db-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-db-black">{heading}</p>
                <p className="text-sm text-db-gray-500 mt-0.5">{body}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </Section>

      {/* Forms CTA */}
      <div className="db-card p-5 bg-db-mint-light border-db-mint">
        <p className="text-sm text-db-teal font-medium mb-1">Ready to submit your forms?</p>
        <p className="text-sm text-db-gray-600 mb-3">Submit your Tenant Information Form, Emergency Coordinator Form, Key Issuance Form, and Handbook Acknowledgement within one week of your move-in date.</p>
        <Link href="/forms" className="text-sm font-semibold text-db-teal hover:underline">View All Forms →</Link>
      </div>
    </div>
  )
}
