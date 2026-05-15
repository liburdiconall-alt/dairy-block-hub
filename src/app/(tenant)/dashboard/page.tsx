import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, ArrowRight, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react'
import { StatusBadge, UrgencyBadge, TypeBadge } from '@/components/ui/StatusBadge'
import { StatsCard } from '@/components/ui/StatsCard'
import { formatDate, getExpectedResponse } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function TenantDashboard() {
  const session = await getServerSession(authOptions)
  const userId  = session!.user.id

  const [requests, stats] = await Promise.all([
    prisma.request.findMany({
      where:   { submittedById: userId },
      orderBy: { createdAt: 'desc' },
      take:    10,
      include: { submittedBy: true, assignedTo: true },
    }),
    prisma.request.groupBy({
      by: ['status'],
      where: { submittedById: userId },
      _count: true,
    }),
  ])

  const total     = requests.length
  const active    = requests.filter(r => !['COMPLETED','CLOSED','DENIED'].includes(r.status)).length
  const completed = requests.filter(r => r.status === 'COMPLETED').length
  const emergency = requests.filter(r => r.urgency === 'EMERGENCY' && !['COMPLETED','CLOSED'].includes(r.status)).length

  const userName = session!.user.name?.split(' ')[0] ?? 'there'
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Welcome ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-script text-db-teal text-xl mb-0.5">{greeting},</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-db-black">{userName}.</h1>
          <p className="text-db-gray-400 mt-1">Here's what's going on with your requests.</p>
        </div>
        <Link href="/requests/new" className="btn-teal self-start sm:self-auto">
          <PlusCircle size={17} /> New Request
        </Link>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Requests" value={total}     icon={FileText}    iconBg="bg-db-gray-100"     iconColor="text-db-gray-600" />
        <StatsCard label="Active"         value={active}    icon={Clock}       iconBg="bg-amber-50"        iconColor="text-db-marigold" />
        <StatsCard label="Completed"      value={completed} icon={CheckCircle2}iconBg="bg-db-mint-light"   iconColor="text-db-teal"     />
        <StatsCard label="Emergency"      value={emergency} icon={AlertTriangle}iconBg={emergency > 0 ? "bg-red-50" : "bg-db-gray-100"} iconColor={emergency > 0 ? "text-db-red" : "text-db-gray-400"} />
      </div>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            type: 'maintenance' as const,
            label: 'Maintenance Request',
            desc: 'HVAC, plumbing, electrical, repairs',
            icon: '🔧',
            color: 'hover:border-db-teal/40',
          },
          {
            type: 'security' as const,
            label: 'Security Request',
            desc: 'Access, incidents, safety concerns',
            icon: '🛡',
            color: 'hover:border-db-orange/40',
          },
        ].map((item) => (
          <Link
            key={item.type}
            href={`/requests/new?type=${item.type}`}
            className="db-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all group border-2 border-transparent"
          >
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1">
              <p className="font-display font-semibold text-db-black group-hover:text-db-teal transition-colors">{item.label}</p>
              <p className="text-sm text-db-gray-400">{item.desc}</p>
            </div>
            <ArrowRight size={16} className="text-db-gray-300 group-hover:text-db-teal transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Recent requests ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-db-black">Recent Requests</h2>
          <Link href="/requests" className="text-sm text-db-teal font-medium hover:text-db-teal-dark flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="db-card p-12 text-center">
            <p className="text-db-gray-300 text-4xl mb-3">📋</p>
            <p className="font-display text-lg font-semibold text-db-black mb-1">No requests yet</p>
            <p className="text-db-gray-400 text-sm mb-4">Submit your first maintenance or security request.</p>
            <Link href="/requests/new" className="btn-teal text-sm">
              <PlusCircle size={15} /> Submit a Request
            </Link>
          </div>
        ) : (
          <div className="db-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-db-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide hidden md:table-cell">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide hidden lg:table-cell">Expected</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-db-gray-50">
                {requests.map((req) => (
                  <tr key={req.id} className="table-row-hover">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-db-black text-sm leading-tight">{req.title}</p>
                      <p className="text-xs text-db-gray-400 mt-0.5">{req.ticketNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <TypeBadge type={req.type} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <UrgencyBadge urgency={req.urgency} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-db-gray-400">{getExpectedResponse(req.urgency)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-db-gray-400">{formatDate(req.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/requests/${req.ticketNumber}`} className="text-xs text-db-teal font-medium hover:text-db-teal-dark">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
