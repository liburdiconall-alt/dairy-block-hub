import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Wrench, Shield, Clock, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import { EmergencyAlert } from '@/components/ui/EmergencyAlert'
import { StatusBadge, UrgencyBadge, TypeBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff Dashboard' }

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [total, active, emergencies, completedThisMonth, recentRequests, maintenancePending, securityPending] =
    await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { status: { notIn: ['COMPLETED','CLOSED','DENIED'] } } }),
      prisma.request.findMany({
        where:   { urgency: 'EMERGENCY', status: { notIn: ['COMPLETED','CLOSED','DENIED'] } },
        orderBy: { createdAt: 'asc' },
        include: { submittedBy: { include: { tenantInfo: true, staffInfo: true } } },
      }),
      prisma.request.count({
        where: {
          status:     'COMPLETED',
          completedAt:{ gte: new Date(new Date().setDate(1)) },
        },
      }),
      prisma.request.findMany({
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
        take:    12,
        include: { submittedBy: true, assignedTo: true },
      }),
      prisma.request.count({ where: { type: 'MAINTENANCE', status: 'SUBMITTED' } }),
      prisma.request.count({ where: { type: 'SECURITY',    status: 'SUBMITTED' } }),
    ])

  const submitted = await prisma.request.count({ where: { status: 'SUBMITTED' } })

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <p className="section-label mb-1">Staff Dashboard</p>
        <h1 className="font-display text-3xl font-bold text-db-black">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h1>
        <p className="text-db-gray-400 mt-1">
          {session?.user.name} · {session?.user.role?.replace(/_/g, ' ')}
        </p>
      </div>

      {/* ── Emergency alerts ─────────────────────────────────────────── */}
      {emergencies.length > 0 && (
        <EmergencyAlert requests={emergencies as any} />
      )}

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Tickets"  value={total}              icon={TrendingUp}  iconBg="bg-db-gray-100"   iconColor="text-db-gray-600"   />
        <StatsCard label="Active"         value={active}             icon={Clock}       iconBg="bg-amber-50"      iconColor="text-db-marigold"   />
        <StatsCard label="Needs Review"   value={submitted}          icon={AlertTriangle}iconBg="bg-orange-50"    iconColor="text-db-orange"     />
        <StatsCard label="Completed / Mo" value={completedThisMonth} icon={CheckCircle2}iconBg="bg-db-mint-light" iconColor="text-db-teal"       />
        <StatsCard
          label="Emergencies"
          value={emergencies.length}
          icon={AlertTriangle}
          iconBg={emergencies.length > 0 ? 'bg-red-50' : 'bg-db-gray-100'}
          iconColor={emergencies.length > 0 ? 'text-db-red' : 'text-db-gray-400'}
        />
      </div>

      {/* ── Quick access tabs ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href: '/admin/maintenance',
            label: 'Maintenance Queue',
            icon: Wrench,
            count: maintenancePending,
            color: 'text-db-teal',
            bg: 'bg-db-mint-light',
            border: 'hover:border-db-teal/40',
          },
          {
            href: '/admin/security',
            label: 'Security Queue',
            icon: Shield,
            count: securityPending,
            color: 'text-db-orange',
            bg: 'bg-orange-50',
            border: 'hover:border-db-orange/40',
          },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className={`db-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all border-2 border-transparent ${q.border} group`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${q.bg}`}>
              <q.icon size={22} className={q.color} />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-db-black">{q.label}</p>
              <p className="text-sm text-db-gray-400">
                {q.count > 0 ? <span className="text-db-orange font-medium">{q.count} awaiting review</span> : 'All clear'}
              </p>
            </div>
            <ArrowRight size={16} className="text-db-gray-300 group-hover:text-db-black transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Recent requests ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-db-black">All Recent Requests</h2>
        </div>

        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Ticket','Type','Status','Priority','Submitter','Assigned','Date',''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Submitter','Assigned'].includes(h) ? 'hidden lg:table-cell' :
                    h === 'Date' ? 'hidden md:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {recentRequests.map((req) => (
                <tr key={req.id} className="table-row-hover">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-db-black leading-tight">{req.title}</p>
                    <p className="text-xs text-db-gray-400 mt-0.5 font-mono">{req.ticketNumber}</p>
                  </td>
                  <td className="px-4 py-3.5"><TypeBadge type={req.type} /></td>
                  <td className="px-4 py-3.5"><StatusBadge status={req.status} size="sm" /></td>
                  <td className="px-4 py-3.5"><UrgencyBadge urgency={req.urgency} size="sm" /></td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{req.submittedBy.name}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-db-gray-500">{req.assignedTo?.name ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-400">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/${req.type === 'MAINTENANCE' ? 'maintenance' : 'security'}/${req.ticketNumber}`}
                      className="text-xs text-db-teal font-medium hover:text-db-teal-dark"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
