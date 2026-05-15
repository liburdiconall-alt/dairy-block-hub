import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="animate-fade-in space-y-8 max-w-2xl">
      <div>
        <p className="section-label mb-1">Admin</p>
        <h1 className="font-display text-3xl font-bold text-db-black">Settings</h1>
        <p className="text-db-gray-400 mt-1">Hub configuration and preferences.</p>
      </div>

      <div className="db-card p-6 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-db-black mb-1">Email Notifications</h2>
          <p className="text-sm text-db-gray-400 mb-4">Configure when and how staff receive email alerts.</p>
          <div className="space-y-3">
            {[
              { label: 'New ticket submitted',           desc: 'Alert managers when a new request comes in' },
              { label: 'Emergency escalation',           desc: 'Always alert all staff for emergency requests' },
              { label: 'Ticket assigned to me',          desc: 'Notify staff when a ticket is assigned to them' },
              { label: 'Status change on my tickets',    desc: 'Alert the submitting tenant on every status change' },
              { label: 'Completion confirmation',        desc: 'Email tenant when ticket is marked Completed' },
            ].map(item => (
              <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-db-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-db-black">{item.label}</p>
                  <p className="text-xs text-db-gray-400">{item.desc}</p>
                </div>
                <button className="flex-shrink-0 w-11 h-6 bg-db-teal rounded-full relative transition-colors">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-db-black mb-1">Branding</h2>
          <p className="text-sm text-db-gray-400 mb-4">Customize the hub's appearance.</p>
          <div className="grid grid-cols-3 gap-3">
            {['Mint (#C4DBCB)', 'Teal (#29967F)', 'Black (#1A1A1A)'].map(c => (
              <div key={c} className="db-card p-3 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                  c.includes('Mint') ? 'bg-db-mint' : c.includes('Teal') ? 'bg-db-teal' : 'bg-db-black'
                }`} />
                <p className="text-xs text-db-gray-400">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="db-card p-6">
        <h2 className="font-display text-lg font-semibold text-db-black mb-4">Coming Soon</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            '🔢 QR Code Submission',
            '📅 Preventive Maintenance Scheduling',
            '📊 Incident Analytics & Heatmaps',
            '⭐ Tenant Satisfaction Ratings',
            '🏢 Vendor Portal',
            '📱 Mobile App',
            '🤖 AI Ticket Categorization',
            '🚨 Emergency Escalation Workflows',
          ].map(f => (
            <div key={f} className="flex items-center gap-2.5 p-3 bg-db-gray-50 rounded-xl">
              <span className="text-lg">{f.split(' ')[0]}</span>
              <span className="text-sm text-db-gray-500">{f.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
