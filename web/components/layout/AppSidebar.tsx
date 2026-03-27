'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Journal', href: '/journal', disabled: true },
  { label: 'Insights', href: '/insights', disabled: true },
]

type AppSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-[#9E9E9E]/30 bg-[#FFFFFF] shadow-sm transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-[#9E9E9E]/30 px-6">
          <Image
            src="/brand/logo-primary.jpeg"
            alt="Ignite Health Now"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>

        <nav className="px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const active = !item.disabled && isActive(item.href)
              const baseClasses =
                'flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition'
              const activeClasses =
                'border-l-4 border-[#007ACC] bg-[#007ACC]/10 text-[#007ACC]'
              const idleClasses = 'text-[#212121] hover:bg-[#007ACC]/5'
              const disabledClasses = 'cursor-not-allowed text-[#9E9E9E] opacity-60'

              if (item.disabled) {
                return (
                  <div key={item.label} className={`${baseClasses} ${disabledClasses}`}>
                    <span>{item.label}</span>
                    <span className="rounded-full border border-[#9E9E9E]/40 px-2 py-1 text-[10px] uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                )
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${baseClasses} ${active ? activeClasses : idleClasses}`}
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}
