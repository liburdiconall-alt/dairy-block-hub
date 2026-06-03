import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, EVENT_TYPE_LABELS } from '@/lib/utils'
import { PlusCircle, Calendar, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Events' }

const TEAMUP_URL = 'https://teamup.com/kst351p9bj5xy5jia6'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const proposals = await prisma.eventProposal.findMany({
    where:   { submittedById: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Tenant Portal</p>
          <h1 className="font-display text-3xl font-bold text-db-black">Event Proposals</h1>
          <p className="text-db-gray-400 text-sm mt-1">Submit and track your event and activation proposals.</p>
        </div>
        <Link href="/events/new" className="btn-teal shrink-0">
          <PlusCircle size={16} /> New Proposal
        </Link>
      </div>

      {/* TeamUp Calendar link */}
      <a
        href={TEAMUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="db-card p-4 flex items-center justify-between gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group border-l-4 border-db-teal"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-db-mint-light flex items-center justify-center flex-shrink-0">
            <Calendar size={17} className="text-db-teal" />
          </div>
          <div>
            <p className="text-sm font-semibold text-db-black group-hover:text-db-teal transition-colors">
              Dairy Block Events Calendar
            </p>
            <p className="text-xs text-db-gray-400 mt-0.5">View the full Dairy Block events schedule on TeamUp</p>
          </div>
        </div>
        <ExternalLink size={15} className="text-db-gray-300 group-hover:text-db-teal transition-colors flex-shrink-0" />
      </a>

      {proposals.length === 0 ? (
        <div className="db-card py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-db-mint-light flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-db-teal" />
          </div>
          <h3 className="font-display text-lg font-bold text-db-black mb-1">No proposals yet</h3>
          <p className="text-db-gray-400 text-sm mb-6">Have an event or activation in mind? Submit a proposal and we'll review it.</p>
          <Link href="/events/new" className="btn-teal inline-flex">
            <PlusCircle size={15} /> Submit a Proposal
          </Link>
        </div>
      ) : (
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Proposal', 'Type', 'Status', 'Date', 'Location', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Location'].includes(h) ? 'hidden md:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {proposals.map(p => (
                <tr key={p.id} className="table-row-hover">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-db-black">{p.title}</p>
                    <p className="text-xs text-db-gray-400 mt-0.5">{p.proposalNumber}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-500">{EVENT_TYPE_LABELS[p.type]}</td>
                  <td className="px-4 py-3.5">
                    <span className={`db-badge text-xs ${EVENT_STATUS_COLORS[p.status]}`}>
                      {EVENT_STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-500">{formatDate(p.proposedDate)}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">{p.location}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link href={`/events/${p.proposalNumber}`} className="text-xs font-semibold text-db-teal hover:text-db-teal-dark transition-colors">
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
  )
}
