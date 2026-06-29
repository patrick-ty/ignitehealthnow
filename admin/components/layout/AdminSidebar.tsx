'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BrandMark } from '@/components/brand/BrandLogo'

// ── Icons (inline SVG, 18×18, stroke) ────────────────────────────────────────

const ActivityIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const GridIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const MegaphoneIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11v2a2 2 0 0 0 2 2h1.2L11 19V5L6.2 9H5a2 2 0 0 0-2 2Z" />
    <path d="M15 8a5 5 0 0 1 0 8" />
  </svg>
)

const LayersIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const UsersIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const BarChartIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const GearIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
)

const SignOutIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(email: string): string {
  const name = email.split('@')[0] || email
  const parts = name.split(/[.\-_]+/).filter(Boolean)
  const chars = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return chars.toUpperCase()
}

function localPart(email: string): string {
  return email.split('@')[0] || email
}

const SoonPill = () => (
  <span className="rounded-full bg-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
    Soon
  </span>
)

// ── Nav items ─────────────────────────────────────────────────────────────────

type NavItem =
  | { label: string; href: string; icon: React.ReactNode; disabled?: false }
  | { label: string; href?: never; icon: React.ReactNode; disabled: true }

const OPERATE: NavItem[] = [
  { label: 'Today', href: '/', icon: ActivityIcon },
  { label: 'Overview', icon: GridIcon, disabled: true },
  { label: 'Content & Social', href: '/content', icon: MegaphoneIcon },
  { label: 'Programs', icon: LayersIcon, disabled: true },
]

const MANAGE: NavItem[] = [
  { label: 'Members', icon: UsersIcon, disabled: true },
  { label: 'Reports', icon: BarChartIcon, disabled: true },
  { label: 'Settings', icon: GearIcon, disabled: true },
]

// ── Sidebar user footer (client — needs state) ────────────────────────────────

function SidebarUserFooter({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative border-t border-line p-3">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-body transition hover:bg-page"
            >
              <span className="text-muted">{SignOutIcon}</span>
              Sign out
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg p-1.5 transition hover:bg-page"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
          {initials(email)}
        </span>
        <span className="flex min-w-0 flex-col items-start">
          <span className="max-w-full truncate text-sm font-medium text-brand-ink">
            {localPart(email)}
          </span>
          <span className="text-xs text-faint">Admin</span>
        </span>
      </button>
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  const renderSection = (items: NavItem[]) =>
    items.map((item) => {
      if (item.disabled) {
        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-faint cursor-default"
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <SoonPill />
          </div>
        )
      }
      const active = isActive(item.href)
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
            active
              ? 'bg-accent-soft text-accent'
              : 'text-muted hover:bg-page hover:text-brand-ink'
          }`}
        >
          <span className="shrink-0">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
        </Link>
      )
    })

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-line bg-surface lg:flex">
      {/* Logo lockup */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <BrandMark size={32} />
        <span className="text-[15px] font-semibold leading-none">
          <span className="text-brand-ink">ignitehealth</span>
          <span className="text-brand-now">now</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="kicker px-3 pb-1 pt-3">Operate</p>
        <div className="space-y-0.5">{renderSection(OPERATE)}</div>

        <p className="kicker px-3 pb-1 pt-5">Manage</p>
        <div className="space-y-0.5">{renderSection(MANAGE)}</div>
      </nav>

      {/* User footer */}
      <SidebarUserFooter email={email} />
    </aside>
  )
}
