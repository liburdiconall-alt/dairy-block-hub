import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode, ElementType } from 'react'
import {
  Phone, Mail, MapPin, Clock, FileText,
  AlertTriangle, Users, Car, Dumbbell,
} from 'lucide-react'

function ResourceCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`db-card p-5 ${className}`}>{children}</div>
}

function ContactRow({ icon: Icon, label, value, href }: {
  icon: ElementType; label: string; value: string; href?: string
}) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-db-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-db-teal" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-db-gray-400">{label}</p>
        <p className="text-sm font-medium text-db-black truncate">{value}</p>
      </div>
    </div>
  )
  if (href) {
    return <a href={href} className="block hover:opacity-80 transition-opacity">{inner}</a>
  }
  return <div>{inner}</div>
}

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [dbContacts, dbHours] = await Promise.all([
    prisma.staffContact.findMany({ where: { isActive: true }, orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.buildingHours.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const managementContacts = dbContacts.filter(c => c.category === 'MANAGEMENT')
  const securityContacts   = dbContacts.filter(c => c.category === 'SECURITY')
  const maintenanceContacts = dbContacts.filter(c => c.category === 'MAINTENANCE')

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">

      <div>
        <h1 className="font-display text-2xl font-bold text-db-black">Building Resources</h1>
        <p className="text-db-gray-500 mt-1 text-sm">All the contacts, hours, and information you need in one place.</p>
      </div>

      {/* Emergency — always first */}
      <ResourceCard className="border-db-red bg-red-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-db-red" />
          </div>
          <h2 className="font-display text-lg font-bold text-db-red">Emergency Contacts</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-red-100">
            <p className="text-xs font-semibold text-db-red uppercase tracking-wider mb-1">Life Safety Emergency</p>
            <a href="tel:911" className="text-2xl font-bold text-db-red block">911</a>
            <p className="text-xs text-db-gray-400 mt-1">Always call 911 first</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-red-100">
            <p className="text-xs font-semibold text-db-gray-500 uppercase tracking-wider mb-1">Building Security</p>
            <a href="tel:3032490178" className="text-lg font-bold text-db-black block">(303) 249-0178</a>
            <p className="text-xs text-db-gray-400">Mobile / After-hours</p>
            <a href="tel:3032973312" className="text-sm font-medium text-db-black block mt-1">(303) 297-3312</a>
            <p className="text-xs text-db-gray-400">Security Desk</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-red-100">
            <p className="text-xs font-semibold text-db-gray-500 uppercase tracking-wider mb-1">Security Email</p>
            <a href="mailto:security@dairyblock.com" className="text-sm font-medium text-db-black break-all">security@dairyblock.com</a>
            <p className="text-xs text-db-gray-400 mt-1">Open 24/7</p>
          </div>
        </div>
      </ResourceCard>

      {/* Property Management Team */}
      <ResourceCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-db-mint-light flex items-center justify-center">
            <Users size={18} className="text-db-teal" />
          </div>
          <h2 className="font-display text-lg font-bold text-db-black">Property Management Team</h2>
        </div>
        <div className="mb-3">
          <ContactRow icon={Mail} label="General Inquiries" value="pm@dairyblock.com" href="mailto:pm@dairyblock.com" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
          {managementContacts.map(({ id, name, title, email }) => (
            <div key={id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-db-mint flex items-center justify-center flex-shrink-0">
                <span className="text-db-teal text-xs font-bold">{name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-db-black">{name}</p>
                <p className="text-xs text-db-gray-400">{title}</p>
                <a href={`mailto:${email}`} className="text-xs text-db-teal hover:underline">{email}</a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-db-gray-100">
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-2">Office Address</p>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-db-teal" />
            <span className="text-sm text-db-black">1800 Wazee Street, Suite 200, Denver, CO 80202</span>
          </div>
        </div>
      </ResourceCard>

      {/* Building Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Security */}
        <ResourceCard>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Security (24/7)</p>
          <div className="space-y-2.5">
            <ContactRow icon={Phone} label="Mobile / After-Hours"  value="(303) 249-0178"          href="tel:3032490178"              />
            <ContactRow icon={Phone} label="Security Desk"         value="(303) 297-3312"          href="tel:3032973312"              />
            <ContactRow icon={Mail}  label="Security Email"        value="security@dairyblock.com" href="mailto:security@dairyblock.com" />
          </div>
          <div className="mt-3 pt-3 border-t border-db-gray-100 space-y-0.5">
            {securityContacts.map(c => (
              <p key={c.id} className="text-xs text-db-gray-400">{c.name} — {c.title}</p>
            ))}
          </div>
        </ResourceCard>

        {/* Maintenance */}
        <ResourceCard>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Maintenance & Operations</p>
          <div className="space-y-2.5">
            <ContactRow icon={Phone} label="After-Hours Maintenance" value="(303) 249-0178" href="tel:3032490178" />
            <ContactRow icon={Mail}  label="Work Orders"             value="pm@dairyblock.com" href="mailto:pm@dairyblock.com" />
          </div>
          <div className="mt-3 pt-3 border-t border-db-gray-100 space-y-0.5">
            {maintenanceContacts.map(c => (
              <p key={c.id} className="text-xs text-db-gray-400">{c.name} — {c.title}</p>
            ))}
          </div>
        </ResourceCard>

        {/* Parking */}
        <ResourceCard>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Parking</p>
          <div className="space-y-2.5">
            <div>
              <p className="text-xs text-db-gray-400 mb-1">LAZ Parking (Garage)</p>
              <ContactRow icon={Phone} label="LAZ Parking" value="(303) 291-1111" href="tel:3032911111" />
            </div>
            <div>
              <p className="text-xs text-db-gray-400 mb-1">Parkwell (Valet)</p>
              <ContactRow icon={Phone} label="Valet" value="(720) 504-3620" href="tel:7205043620" />
            </div>
            <div>
              {/* TODO: Confirm new towing company with Liam before updating */}
              <p className="text-xs text-db-gray-400 mb-1">Ace Towing (Emergency)</p>
              <ContactRow icon={Phone} label="Towing" value="(303) 980-8770" href="tel:3039808770" />
            </div>
          </div>
        </ResourceCard>

        {/* The Maven Hotel */}
        <ResourceCard>
          <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">The Maven Hotel</p>
          <div className="space-y-2.5">
            <ContactRow icon={MapPin} label="Address"  value="1850 Wazee St, Denver, CO 80202" />
            <ContactRow icon={Phone}  label="Phone"    value="(720) 460-2727"                  href="tel:7204602727"         />
            <ContactRow icon={Mail}   label="Website"  value="themavenhotel.com"               href="https://themavenhotel.com" />
          </div>
        </ResourceCard>
      </div>

      {/* Building Hours & Access */}
      <ResourceCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock size={18} className="text-blue-600" />
          </div>
          <h2 className="font-display text-lg font-bold text-db-black">Building Hours & Access</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Regular Hours</p>
            <div className="space-y-2">
              {dbHours.map(({ id, label, hours }) => (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-db-gray-500">{label}</span>
                  <span className="font-medium text-db-black">{hours}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-db-gray-400 mt-3 pt-3 border-t border-db-gray-100">Security Desk: Open 24/7</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Observed Holidays</p>
            <ul className="text-sm text-db-gray-600 space-y-1">
              {["New Year's Day",'Memorial Day','Juneteenth','Independence Day','Labor Day','Thanksgiving Day','Christmas Day'].map(h => (
                <li key={h} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-db-teal flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ResourceCard>

      {/* Amenities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <ResourceCard>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell size={16} className="text-db-teal" />
            <p className="text-sm font-semibold text-db-black">Fitness Center</p>
          </div>
          <p className="text-xs text-db-gray-500">2nd floor, 1825 Blake St. State-of-the-art equipment, locker rooms, yoga studio. Office tenants only — fitness waiver required.</p>
          <Link href="/forms/fitness-waiver" className="text-xs text-db-teal font-medium mt-2 block hover:underline">Submit Waiver →</Link>
        </ResourceCard>
        <ResourceCard>
          <div className="flex items-center gap-2 mb-2">
            <Car size={16} className="text-db-teal" />
            <p className="text-sm font-semibold text-db-black">Bike Storage</p>
          </div>
          <p className="text-xs text-db-gray-500">Southwest corner of B2 parking garage level. Day-use only — no overnight storage. Access via access card.</p>
          <Link href="/forms/key-request" className="text-xs text-db-teal font-medium mt-2 block hover:underline">Request Bike Storage Access →</Link>
        </ResourceCard>
        <ResourceCard>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-db-teal" />
            <p className="text-sm font-semibold text-db-black">Wi-Fi & Conference Rooms</p>
          </div>
          <p className="text-xs text-db-gray-500">Complimentary guest Wi-Fi throughout Dairy Block. Conference and meeting spaces available at various locations around the block.</p>
          <a href="mailto:pm@dairyblock.com" className="text-xs text-db-teal font-medium mt-2 block hover:underline">Contact PM for Info →</a>
        </ResourceCard>
      </div>

      {/* Forms & Documents */}
      <ResourceCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <FileText size={18} className="text-purple-600" />
          </div>
          <h2 className="font-display text-lg font-bold text-db-black">Forms & Documents</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'Key / Access Card Request',        href: '/forms/key-request'              },
            { label: 'Fitness Center Waiver',            href: '/forms/fitness-waiver'           },
            { label: 'Pet Registration',                 href: '/forms/pet-registration'         },
            { label: 'Emergency Coordinator Form',       href: '/forms/emergency-coordinator'    },
            { label: 'Handbook Acknowledgement',         href: '/forms/handbook-acknowledgement' },
            { label: 'Monthly Sales Report (Retail)',    href: '/forms/sales-report'             },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between p-3 rounded-xl border border-db-gray-100 hover:border-db-teal/30 hover:bg-db-mint-light/30 transition-all text-sm text-db-black"
            >
              <span>{label}</span>
              <span className="text-db-teal text-xs">Start →</span>
            </Link>
          ))}
        </div>
      </ResourceCard>

      {/* Useful Links */}
      <ResourceCard>
        <p className="text-xs font-semibold text-db-gray-400 uppercase tracking-wider mb-3">Useful Links</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'LAZ Parking Portal',       href: 'https://parkdairyblock.com'   },
            { label: 'Parkwell Valet',            href: 'https://goparkwell.com'        },
            { label: 'Reserve a Parking Meter',  href: 'https://prdwmq.etimspayments.com/pbw/include/denver/meterinput.jsp' },
            { label: 'The Maven Hotel',          href: 'https://themavenhotel.com'     },
            { label: 'Yardi Commercial Café',    href: '#'                             },
            { label: 'Ace Towing Enterprise',    href: 'https://acetowingdenver.com'   },
          ].map(({ label, href }) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-db-gray-100 hover:border-db-teal/30 hover:bg-db-mint-light/30 transition-all text-sm text-db-black"
            >
              <span>{label}</span>
              <span className="text-db-teal text-xs">↗</span>
            </a>
          ))}
        </div>
      </ResourceCard>

    </div>
  )
}
