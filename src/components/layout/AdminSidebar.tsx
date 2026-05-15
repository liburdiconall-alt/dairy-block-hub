'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Wrench, Shield, Users, Settings,
  LogOut, ChevronDown, User, Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const MAIN_LINKS = [
  { href: '/admin/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/maintenance',  label: 'Maintenance',  icon: Wrench           },
  { href: '/admin/security',     label: 'Security',     icon: Shield           },
  { href: '/admin/staff',        label: 'Staff',        icon: Users            },
  { href: '/admin/settings',     label: 'Settings',     icon: Settings         },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userOpen, setUserOpen] = useState(false)

  const role = session?.user.role

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
          return (
            <Link
              key={href}
              href={href}
              className={active ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={17} />
              {label}
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
