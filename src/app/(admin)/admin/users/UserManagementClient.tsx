'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, XCircle, RefreshCw, UserCog, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type User = {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: Date
  tenantInfo: { unit?: string | null; building?: string | null; company?: string | null } | null
  staffInfo:  { department?: string | null } | null
}

const ROLE_OPTIONS = [
  { value: 'TENANT',            label: 'Tenant' },
  { value: 'MAINTENANCE_TECH',  label: 'Maintenance Tech' },
  { value: 'SECURITY_OFFICER',  label: 'Security Officer' },
  { value: 'PROPERTY_MANAGER',  label: 'Property Manager' },
  { value: 'ADMIN',             label: 'Admin' },
  { value: 'VENDOR',            label: 'Vendor' },
]

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    TENANT:           'bg-blue-50 text-blue-700 border-blue-200',
    MAINTENANCE_TECH: 'bg-orange-50 text-orange-700 border-orange-200',
    SECURITY_OFFICER: 'bg-purple-50 text-purple-700 border-purple-200',
    PROPERTY_MANAGER: 'bg-db-mint-light text-db-teal border-db-mint',
    ADMIN:            'bg-db-black text-white border-db-black',
    VENDOR:           'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={cn('db-badge text-xs border', colors[role] ?? 'bg-gray-100 text-gray-600')}>
      {role.replace(/_/g, ' ')}
    </span>
  )
}

function DenyModal({ user, onClose, onConfirm }: {
  user: User
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <h3 className="font-display text-lg font-bold text-db-black mb-1">Deny access request</h3>
        <p className="text-sm text-db-gray-400 mb-4">
          Denying access for <strong>{user.name ?? user.email}</strong>. They will receive an email notification.
        </p>
        <label className="block text-sm font-medium text-db-gray-700 mb-1.5">
          Reason <span className="text-db-gray-300 font-normal">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="db-input resize-none"
          placeholder="e.g. Not a current Dairy Block tenant"
        />
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-db-red text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Deny Access
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserManagementClient({ pending, active, denied, canManage }: {
  pending:    User[]
  active:     User[]
  denied:     User[]
  canManage:  boolean
}) {
  const router = useRouter()
  const [tab, setTab]         = useState<'pending' | 'active' | 'denied'>('pending')
  const [loading, setLoading] = useState<string | null>(null)
  const [denyTarget, setDenyTarget] = useState<User | null>(null)
  const [roleEditing, setRoleEditing] = useState<string | null>(null)

  async function callApi(userId: string, body: object) {
    setLoading(userId)
    await fetch(`/api/admin/users/${userId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    setLoading(null)
    router.refresh()
  }

  const tabs = [
    { key: 'pending' as const, label: 'Pending Approval', count: pending.length },
    { key: 'active'  as const, label: 'Active Users',     count: active.length  },
    { key: 'denied'  as const, label: 'Denied',           count: denied.length  },
  ]

  const users = tab === 'pending' ? pending : tab === 'active' ? active : denied

  return (
    <div className="animate-fade-in space-y-6">
      {denyTarget && (
        <DenyModal
          user={denyTarget}
          onClose={() => setDenyTarget(null)}
          onConfirm={reason => { callApi(denyTarget.id, { action: 'deny', reason }); setDenyTarget(null) }}
        />
      )}

      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-3xl font-bold text-db-black">User Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-db-gray-50 rounded-xl p-1 w-fit border border-db-gray-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              tab === t.key
                ? 'bg-white text-db-black shadow-sm border border-db-gray-100'
                : 'text-db-gray-400 hover:text-db-gray-600'
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className={cn(
                'text-xs rounded-full px-1.5 py-0.5 font-semibold min-w-[20px] text-center',
                t.key === 'pending'
                  ? 'bg-db-orange text-white'
                  : 'bg-db-gray-200 text-db-gray-600'
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="db-card overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center text-db-gray-300 text-sm">
            {tab === 'pending'
              ? 'No pending access requests.'
              : tab === 'active'
              ? 'No active users.'
              : 'No denied users.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-db-gray-100 bg-db-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide hidden md:table-cell">Unit / Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-db-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-db-gray-400 uppercase tracking-wide">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-db-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="px-4 py-3.5 font-medium text-db-black">{u.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-db-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-500">
                      {u.tenantInfo?.unit ? `${u.tenantInfo.unit}${u.tenantInfo.building ? ` · ${u.tenantInfo.building}` : ''}` : ''}
                      {u.tenantInfo?.company ? <span className="block text-db-gray-400">{u.tenantInfo.company}</span> : null}
                      {!u.tenantInfo?.unit && !u.tenantInfo?.company ? '—' : null}
                    </td>
                    <td className="px-4 py-3.5">
                      {canManage && tab === 'active' ? (
                        <div className="relative">
                          <select
                            defaultValue={u.role}
                            onChange={e => callApi(u.id, { action: 'changeRole', newRole: e.target.value })}
                            disabled={loading === u.id}
                            className="appearance-none text-xs font-medium rounded-lg border border-db-gray-200 bg-db-gray-50 px-2.5 py-1.5 pr-6 text-db-gray-700 cursor-pointer hover:border-db-teal focus:outline-none focus:border-db-teal transition-colors"
                          >
                            {ROLE_OPTIONS.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-db-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <RoleBadge role={u.role} />
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-db-gray-400">{formatDate(u.createdAt)}</td>
                    {canManage && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tab === 'pending' && (
                            <>
                              <button
                                onClick={() => callApi(u.id, { action: 'approve' })}
                                disabled={loading === u.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-db-mint-light text-db-teal text-xs font-semibold border border-db-mint hover:bg-db-mint transition-colors disabled:opacity-50"
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                onClick={() => setDenyTarget(u)}
                                disabled={loading === u.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-db-red text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <XCircle size={13} /> Deny
                              </button>
                            </>
                          )}
                          {tab === 'active' && (
                            <button
                              onClick={() => callApi(u.id, { action: 'deactivate' })}
                              disabled={loading === u.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-db-red text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={13} /> Deactivate
                            </button>
                          )}
                          {tab === 'denied' && (
                            <button
                              onClick={() => callApi(u.id, { action: 'reactivate' })}
                              disabled={loading === u.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-db-mint-light text-db-teal text-xs font-semibold border border-db-mint hover:bg-db-mint transition-colors disabled:opacity-50"
                            >
                              <RefreshCw size={13} /> Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
