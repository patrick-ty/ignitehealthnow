'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'
import AdvocateLauncher from '@/components/advocate/AdvocateLauncher'

export function getDefaultAvatarUrl(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i += 1) {
    hash += userId.charCodeAt(i)
  }
  const index = hash % 12
  return `/avatars/system/avatar-${index}.png`
}

const titleMap: Record<string, { title: string; kicker: string }> = {
  '/dashboard': { title: 'Dashboard', kicker: 'Overview' },
  '/profile': { title: 'Profile', kicker: 'Account' },
  '/profile/setup': { title: 'Profile Setup', kicker: 'Account' },
  '/journal': { title: 'Journal', kicker: 'Tracking' },
  '/insights': { title: 'Insights', kicker: 'Trends' },
}

function resolveTitle(pathname: string): { title: string; kicker: string } {
  if (titleMap[pathname]) {
    return titleMap[pathname]
  }

  const entry = Object.entries(titleMap).find(([path]) => pathname.startsWith(`${path}/`))
  return entry ? entry[1] : { title: 'Dashboard', kicker: 'Overview' }
}

export default function AppShell({
  children,
  profile,
  fallbackUserId,
}: {
  children: React.ReactNode
  profile?: {
    user_id?: string | null
    display_name?: string | null
    avatar_url?: string | null
  } | null
  fallbackUserId?: string | null
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { title, kicker } = useMemo(() => resolveTitle(pathname), [pathname])
  /**
   * UI IDENTITY CONTRACT (LOCKED)
   *
   * AppShell must derive all user-visible identity exclusively from
   * the Profile API response.
   *
   * Allowed:
   * - profile.display_name
   * - profile.avatar_url
   *
   * Forbidden:
   * - email
   * - Supabase auth metadata
   * - JWT claims
   *
   * If profile data is missing, use neutral fallbacks only.
   */
  const displayName = profile?.display_name?.trim() || ''
  const idForAvatar = profile?.user_id || fallbackUserId || ''
  const avatarUrl =
    profile?.avatar_url && profile.avatar_url.trim().length > 0
      ? profile.avatar_url.trim()
      // avatar_url is expected to be a URL from storage (Supabase Storage / GCS).
      : idForAvatar
        ? getDefaultAvatarUrl(idForAvatar)
        : '/avatars/system/avatar-0.png'

  if (process.env.NODE_ENV !== 'production') {
    if ((profile as { email?: string | null } | null | undefined)?.email) {
      console.warn(
        '[UI Identity Contract Violation] Email detected in profile object'
      )
    }
  }

  return (
    <div className="min-h-screen bg-page text-body">
      <div className="flex">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
        <div className="flex min-h-screen w-full flex-col lg:pl-64">
          <AppHeader
            title={title}
            kicker={kicker}
            userDisplayName={displayName}
            avatarUrl={avatarUrl}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 px-6 py-6">
            {children}
          </main>
        </div>
      </div>
      <AdvocateLauncher />
    </div>
  )
}
