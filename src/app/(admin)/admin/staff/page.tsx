import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff' }

export default async function StaffPage() {
  const staff = await prisma.user.findMany({
    where:   { role: { not: 'TENANT' } },
    include: { staffInfo: true },
    orderBy: { name: 'asc' },
  })

  const tenants = await prisma.user.findMany({
    where:   { role: 'TENANT' },
    include: { tenantInfo: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-3xl font-bold text-db-black">Staff & Tenants</h1>
      </div>

      {/* Staff table */}
      <div>
        <h2 className="font-display text-lg font-bold text-db-black mb-4">Staff Members</h2>
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Name','Email','Role','Department','Badge','Since'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Department','Badge'].includes(h) ? 'hidden md:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {staff.map(s => (
                <tr key={s.id} className="table-row-hover">
                  <td className="px-4 py-3.5 font-medium text-db-black">{s.name}</td>
                  <td className="px-4 py-3.5 text-db-gray-500 text-xs">{s.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="db-badge bg-db-mint-light text-db-teal border border-db-mint text-xs">
                      {s.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">{s.staffInfo?.department ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs font-mono text-db-gray-400">{s.staffInfo?.badge ?? '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-400">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenants table */}
      <div>
        <h2 className="font-display text-lg font-bold text-db-black mb-4">Tenants</h2>
        <div className="db-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-db-gray-100 bg-db-gray-50">
                {['Name','Email','Unit','Building','Company','Since'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide ${
                    ['Building','Company'].includes(h) ? 'hidden md:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-db-gray-50">
              {tenants.map(t => (
                <tr key={t.id} className="table-row-hover">
                  <td className="px-4 py-3.5 font-medium text-db-black">{t.name}</td>
                  <td className="px-4 py-3.5 text-db-gray-500 text-xs">{t.email}</td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-600">{t.tenantInfo?.unit ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">{t.tenantInfo?.building ?? '—'}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">{t.tenantInfo?.company ?? '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-db-gray-400">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
