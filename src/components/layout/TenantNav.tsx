'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, PlusCircle, ClipboardList, LogOut, ChevronDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/requests',    label: 'My Requests',     icon: ClipboardList   },
  { href: '/requests/new',label: 'New Request',     icon: PlusCircle      },
]

export function TenantNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-db-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/dashboard" className="flex-shrink-0">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-db-teal block leading-none">Dairy Block</span>
          <span className="font-display text-db-black font-bold text-base leading-tight">Request Hub</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'bg-db-mint-light text-db-teal'
                  : 'text-db-gray-500 hover:text-db-black hover:bg-db-gray-50'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-db-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-db-mint flex items-center justify-center">
              <User size={14} className="text-db-teal" />
            </div>
            <span className="text-sm font-medium text-db-black hidden sm:block max-w-[120px] truncate">
              {session?.user.name ?? session?.user.email}
            </span>
            <ChevronDown size={14} className="text-db-gray-400" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 db-card p-1.5 z-20 animate-slide-up">
                <div className="px-3 py-2 border-b border-db-gray-100 mb-1">
                  <p className="text-xs font-semibold text-db-black truncate">{session?.user.name}</p>
                  <p className="text-xs text-db-gray-400 truncate">{session?.user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-db-red rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-db-mint-light text-db-teal'
                : 'text-db-gray-500 hover:text-db-black'
            )}
          >
            <Icon size={13} /> {label}
          </Link>
        ))}
      </div>
    </header>
  )
}
