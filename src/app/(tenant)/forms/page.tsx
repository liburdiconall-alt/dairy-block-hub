import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Key, Dumbbell, PawPrint, AlertCircle, BookOpen, BarChart2, ChevronRight } from 'lucide-react'

const FORM_CATEGORIES = [
  {
    category: 'Building Access',
    forms: [
      {
        href: '/forms/key-request',
        icon: Key,
        label: 'Key / Access Card Request',
        description: 'Request a new key, replacement access card, or program an existing card for building entry, bike storage, or fitness center.',
        iconBg: 'bg-db-mint-light',
        iconColor: 'text-db-teal',
      },
      {
        href: '/forms/fitness-waiver',
        icon: Dumbbell,
        label: 'Fitness Center Waiver',
        description: 'Complete the fitness center waiver and release form required to gain access to the 2nd floor fitness center at 1825 Blake St.',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
    ],
  },
  {
    category: 'Pets & Amenities',
    forms: [
      {
        href: '/forms/pet-registration',
        icon: PawPrint,
        label: 'Pet Registration',
        description: 'Register your pet to bring them to the office. Requires written approval from Property Management before a pet may be brought on-site.',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
    ],
  },
  {
    category: 'Compliance & Safety',
    forms: [
      {
        href: '/forms/emergency-coordinator',
        icon: AlertCircle,
        label: 'Emergency Coordinator Form',
        description: 'Designate emergency coordinators for your floor or suite. One coordinator is required per every 20 on-site staff members.',
        iconBg: 'bg-red-50',
        iconColor: 'text-db-red',
      },
      {
        href: '/forms/handbook-acknowledgement',
        icon: BookOpen,
        label: 'Handbook Acknowledgement',
        description: 'Acknowledge receipt and understanding of the Dairy Block Tenant Handbook. Required within one week of your move-in date.',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
    ],
  },
  {
    category: 'Retail Tenants',
    forms: [
      {
        href: '/forms/sales-report',
        icon: BarChart2,
        label: 'Monthly Sales Report',
        description: 'Submit your monthly gross sales report. Due by the 5th of each month. The 2% improvement fee is calculated on gross sales.',
        iconBg: 'bg-db-mint-light',
        iconColor: 'text-db-teal',
      },
    ],
  },
]

export default async function FormsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-8">

      <div>
        <h1 className="font-display text-2xl font-bold text-db-black">Forms & Documents</h1>
        <p className="text-db-gray-500 mt-1 text-sm">Submit required forms and requests to Property Management.</p>
      </div>

      {FORM_CATEGORIES.map(({ category, forms }) => (
        <div key={category}>
          <h2 className="font-display text-sm font-bold text-db-gray-400 uppercase tracking-wider mb-3">{category}</h2>
          <div className="space-y-3">
            {forms.map(({ href, icon: Icon, label, description, iconBg, iconColor }) => (
              <Link key={href} href={href}
                className="db-card p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
              >
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-db-black group-hover:text-db-teal transition-colors">{label}</p>
                  <p className="text-sm text-db-gray-400 mt-0.5 leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-1 text-db-teal text-sm font-medium whitespace-nowrap mt-0.5">
                  Start Form <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

    </div>
  )
}
