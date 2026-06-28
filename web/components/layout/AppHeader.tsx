'use client'

/* eslint-disable @next/next/no-img-element */

type AppHeaderProps = {
  title?: string
  kicker?: string
  userDisplayName?: string
  avatarUrl?: string
  onMenuClick?: () => void
}

export default function AppHeader({
  title = 'Dashboard',
  kicker = 'Overview',
  userDisplayName,
  avatarUrl,
  onMenuClick,
}: AppHeaderProps) {
  const resolvedAvatarUrl =
    avatarUrl && avatarUrl.trim().length ? avatarUrl : '/avatars/system/avatar-0.png'

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/30 lg:hidden"
            aria-label="Open sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden w-72 items-center gap-2 rounded-full border border-line bg-page px-4 py-2 text-sm text-faint lg:flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-4.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <span>Search</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-full border border-line p-2 text-muted transition hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 17h-5m7-4v-3.5a4.5 4.5 0 0 0-9 0V13l-1.5 2h12l-1.5-2Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17a2.5 2.5 0 0 0 5 0" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-now text-[10px] font-semibold text-white">
              2
            </span>
          </button>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line p-1 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30">
              <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent">
                <img src={resolvedAvatarUrl} alt="User avatar" className="h-9 w-9 object-cover" />
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-surface p-2 shadow-lg">
              <div className="px-3 py-2 text-xs text-faint">
                {userDisplayName ? `Hello ${userDisplayName}` : 'Hello'}
              </div>
              <a href="/profile" className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-body hover:bg-accent-soft hover:text-accent">
                Profile
              </a>
              <button type="button" className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-faint" disabled>
                Settings
              </button>
              <div className="my-1 h-px bg-line" />
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-body hover:bg-accent-soft hover:text-accent">
                  Logout
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>

      <div className="border-t border-line px-6 py-4">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-1 font-serif text-xl font-semibold text-brand-ink">{title}</h1>
      </div>
    </header>
  )
}
