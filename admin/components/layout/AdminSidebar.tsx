'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand/BrandLogo'

const NAV = [
  { label: 'Content & Social', href: '/content', enabled: true },
  { label: 'Today', href: '/today', enabled: false },
  { label: 'Overview', href: '/overview', enabled: false },
  { label: 'Programs', href: '/programs', enabled: false },
  { label: 'Members', href: '/members', enabled: false },
  { label: 'Reports', href: '/reports', enabled: false },
  { label: 'Settings', href: '/settings', enabled: false },
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
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition'
            if (!item.enabled) {
              return (
                <div key={item.label} className={`${base} cursor-not-allowed text-faint`}>
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full bg-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">Soon</span>
                </div>
              )
            }
            return (
              <Link key={item.label} href={item.href}
                className={`${base} ${active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-page hover:text-brand-ink'}`}>
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
