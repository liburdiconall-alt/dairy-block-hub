import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import {
  Wrench, Shield, Calendar, BookOpen, FolderOpen, FileText,
  ChevronRight, Phone, Mail,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [recentRequests, myEvents, announcements] = await Promise.all([
    prisma.request.count({ where: { submittedById: session.user.id } }),
    prisma.eventProposal.count({ where: { submittedById: session.user.id, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
    prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">

      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-db-black to-[#2a2a2a] px-8 py-7 flex items-center justify-between gap-6">
        <div>
          <p className="text-db-mint text-sm font-semibold tracking-wide mb-1">Welcome back</p>
          <h1 className="font-display text-2xl font-bold text-white">Hi, {firstName} 👋</h1>
          <p className="text-white/50 text-sm mt-1">Your Dairy Block Tenant Hub</p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {recentRequests > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{recentRequests}</p>
              <p className="text-xs text-white/50">Requests</p>
            </div>
          )}
          {myEvents > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-db-orange">{myEvents}</p>
              <p className="text-xs text-white/50">Active Events</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="font-display text-lg font-bold text-db-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/requests/new', icon: Wrench,    label: 'Submit Request',   sub: 'Maintenance or security', color: 'text-db-teal',    bg: 'bg-db-mint-light' },
            { href: '/events/new',   icon: Calendar,  label: 'Plan an Event',    sub: 'Submit a proposal',       color: 'text-db-orange',  bg: 'bg-orange-50'     },
            { href: '/forms',        icon: FileText,  label: 'Forms & Docs',     sub: 'Keys, pets, fitness',     color: 'text-purple-600', bg: 'bg-purple-50'     },
            { href: '/handbook',     icon: BookOpen,  label: 'Tenant Handbook',  sub: 'Rules & policies',        color: 'text-blue-600',   bg: 'bg-blue-50'       },
            { href: '/resources',    icon: FolderOpen,label: 'Resources',        sub: 'Contacts & info',         color: 'text-amber-600',  bg: 'bg-amber-50'      },
            { href: '/requests',     icon: Shield,    label: 'My Requests',      sub: 'Track your tickets',      color: 'text-db-teal',    bg: 'bg-db-mint-light' },
          ].map(({ href, icon: Icon, label, sub, color, bg }) => (
            <Link key={href} href={href}
              className="db-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group flex flex-col gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="font-semibold text-db-black text-sm group-hover:text-db-teal transition-colors">{label}</p>
                <p className="text-xs text-db-gray-400 mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`db-card p-4 border ${
              a.type === 'URGENT'  ? 'bg-red-50 border-db-red'        :
              a.type === 'WARNING' ? 'bg-amber-50 border-amber-200'   :
                                     'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm font-bold mb-0.5 ${
                a.type === 'URGENT'  ? 'text-db-red'     :
                a.type === 'WARNING' ? 'text-amber-700'  :
                                       'text-blue-700'
              }`}>{a.title}</p>
              <p className={`text-xs ${
                a.type === 'URGENT'  ? 'text-db-red/80'    :
                a.type === 'WARNING' ? 'text-amber-700/80' :
                                       'text-blue-700/80'
              }`}>{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Two-column: Key Contacts + Building Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Key Contacts */}
        <div className="db-card p-6">
          <h3 className="font-display text-base font-bold text-db-black mb-4">Key Contacts</h3>
          <div className="space-y-3">
            {[
              { label: 'Property Management', value: 'pm@dairyblock.com',       icon: Mail  },
              { label: 'Security Desk',        value: '(303) 249-0178',          icon: Phone },
              { label: 'Security Email',       value: 'security@dairyblock.com', icon: Mail  },
              { label: 'Parking (LAZ)',         value: '(303) 291-1111',          icon: Phone },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-db-gray-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-db-teal" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-db-gray-400">{label}</p>
                  <p className="text-sm font-medium text-db-black truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Hours + Links */}
        <div className="db-card p-6">
          <h3 className="font-display text-base font-bold text-db-black mb-4">Building Hours</h3>
          <div className="space-y-2 mb-5">
            {[
              { day: 'Monday – Friday', hours: '7:00 AM – 9:00 PM' },
              { day: 'Saturday',        hours: '9:00 AM – 1:00 PM' },
              { day: 'Sunday',          hours: 'Closed'             },
            ].map(({ day, hours }) => (
              <div key={day} className="flex items-center justify-between text-sm">
                <span className="text-db-gray-500">{day}</span>
                <span className="font-medium text-db-black">{hours}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-db-gray-100 pt-4 space-y-2">
            <Link href="/handbook" className="flex items-center justify-between text-sm text-db-teal hover:text-db-black transition-colors">
              <span>View Tenant Handbook</span><ChevronRight size={14} />
            </Link>
            <Link href="/resources" className="flex items-center justify-between text-sm text-db-teal hover:text-db-black transition-colors">
              <span>Building Resources</span><ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
