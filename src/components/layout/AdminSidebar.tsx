'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Wrench, Shield, Users, Settings,
  LogOut, ChevronDown, User, UserCog, Calendar, FileText, PenSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const MAIN_LINKS = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench          },
  { href: '/admin/security',    label: 'Security',    icon: Shield          },
  { href: '/admin/events',      label: 'Events',      icon: Calendar        },
  { href: '/admin/submissions', label: 'Submissions', icon: FileText        },
  { href: '/admin/users',       label: 'Users',       icon: UserCog         },
  { href: '/admin/staff',       label: 'Staff',       icon: Users           },
  { href: '/admin/content',     label: 'Content',     icon: PenSquare       },
  { href: '/admin/settings',    label: 'Settings',    icon: Settings        },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userOpen, setUserOpen] = useState(false)
  const [pendingUsers, setPendingUsers]           = useState(0)
  const [pendingEvents, setPendingEvents]         = useState(0)
  const [pendingSubmissions, setPendingSubmissions] = useState(0)

  const role = session?.user.role

  useEffect(() => {
    if (role === 'ADMIN' || role === 'PROPERTY_MANAGER') {
      fetch('/api/admin/users/pending-count')
        .then(r => r.json())
        .then(d => setPendingUsers(d.count ?? 0))
        .catch(() => {})
      fetch('/api/events/pending-count')
        .then(r => r.json())
        .then(d => setPendingEvents(d.count ?? 0))
        .catch(() => {})
      fetch('/api/admin/submissions/count')
        .then(r => r.json())
        .then(d => setPendingSubmissions(d.count ?? 0))
        .catch(() => {})
    }
  }, [role, pathname])

  return (
    <aside className="w-64 flex-shrink-0 bg-db-black min-h-screen flex flex-col">

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/8">
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-db-mint block leading-none mb-1">Dairy Block</span>
        <p className="font-display text-white font-bold text-base leading-tight">Staff Hub</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {MAIN_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          const badge =
            href === '/admin/users'        && pendingUsers        > 0 ? pendingUsers        :
            href === '/admin/events'       && pendingEvents       > 0 ? pendingEvents       :
            href === '/admin/submissions'  && pendingSubmissions  > 0 ? pendingSubmissions  : null
          return (
            <Link
              key={href}
              href={href}
              className={cn(active ? 'sidebar-link-active' : 'sidebar-link', 'flex items-center justify-between')}
            >
              <span className="flex items-center gap-2">
                <Icon size={17} />
                {label}
              </span>
              {badge && (
                <span className="text-[10px] font-bold bg-db-orange text-white rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/8 pt-4 relative">
        <button
          onClick={() => setUserOpen(!userOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-db-teal flex items-center justify-center flex-shrink-0">
            <User size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{session?.user.name ?? 'Staff'}</p>
            <p className="text-xs text-db-gray-500 truncate">{role?.replace(/_/g, ' ')}</p>
          </div>
          <ChevronDown size={13} className="text-db-gray-500 flex-shrink-0" />
        </button>

        {userOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-db-gray-800 rounded-xl border border-white/10 p-1.5 z-20">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs text-white font-medium truncate">{session?.user.name}</p>
                <p className="text-xs text-db-gray-500 truncate">{session?.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-db-red rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
