'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/brand/BrandLogo'

const DashboardIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const ContentIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11v2a2 2 0 0 0 2 2h1.2L11 19V5L6.2 9H5a2 2 0 0 0-2 2Z" />
    <path d="M15 8a5 5 0 0 1 0 8" />
  </svg>
)

const NAV: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'Dashboard', href: '/', icon: DashboardIcon },
  { label: 'Content & Social', href: '/content', icon: ContentIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5">
        <BrandLogo size={32} />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="kicker px-3 pb-2">Marketing Ops</p>
        <div className="space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-page hover:text-brand-ink'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
