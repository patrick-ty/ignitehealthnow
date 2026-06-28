'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { BrandLogo } from '@/components/brand/BrandLogo'

type NavItem = {
  label: string
  href: string
  icon: ReactNode
  disabled?: boolean
}

type NavGroup = {
  heading: string
  items: NavItem[]
}

const icon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px] shrink-0"
    aria-hidden
  >
    {path}
  </svg>
)

const navGroups: NavGroup[] = [
  {
    heading: 'Today',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: icon(
          <>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </>,
        ),
      },
    ],
  },
  {
    heading: 'Health',
    items: [
      {
        label: 'Journal',
        href: '/journal',
        disabled: true,
        icon: icon(
          <>
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
            <path d="M8 8h7M8 12h7" />
          </>,
        ),
      },
      {
        label: 'Insights',
        href: '/insights',
        disabled: true,
        icon: icon(
          <>
            <path d="M4 19V5" />
            <path d="M4 15l4-4 4 3 7-8" />
          </>,
        ),
      },
    ],
  },
  {
    heading: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/profile',
        icon: icon(
          <>
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </>,
        ),
      },
    ],
  },
]

type AppSidebarProps = {
  isOpen: boolean
  onClose: () => void
  displayName?: string
  avatarUrl?: string
}

export default function AppSidebar({
  isOpen,
  onClose,
  displayName,
  avatarUrl,
}: AppSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-brand-ink/30 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-line bg-surface transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-line px-5">
          <BrandLogo size={32} />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.heading} className="mb-6 last:mb-0">
              <p className="kicker px-3 pb-2">{group.heading}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = !item.disabled && isActive(item.href)
                  const base =
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition'

                  if (item.disabled) {
                    return (
                      <div
                        key={item.label}
                        className={`${base} cursor-not-allowed text-faint`}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        <span className="rounded-full bg-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                          Soon
                        </span>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`${base} ${
                        active
                          ? 'bg-accent-soft text-accent'
                          : 'text-muted hover:bg-page hover:text-brand-ink'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-9 w-9 object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-accent">
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-ink">
                {displayName || 'Your account'}
              </p>
              <p className="kicker">Member</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
