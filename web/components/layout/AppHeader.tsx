'use client'

/* eslint-disable @next/next/no-img-element */


type AppHeaderProps = {
  title?: string
  userDisplayName?: string
  avatarUrl?: string
  onMenuClick?: () => void
}

export default function AppHeader({
  title = 'Dashboard',
  userDisplayName,
  avatarUrl,
  onMenuClick,
}: AppHeaderProps) {
  const resolvedAvatarUrl =
    avatarUrl && avatarUrl.trim().length ? avatarUrl : '/avatars/system/avatar-0.png'

  return (
    <header className="sticky top-0 z-20 border-b border-[#9E9E9E]/30 bg-[#FFFFFF]">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-sm text-[#212121] hover:border-[#007ACC] hover:text-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40"
            aria-label="Open sidebar"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden w-72 items-center gap-2 rounded-full border border-[#9E9E9E]/40 bg-[#FFFFFF] px-4 py-2 text-sm text-[#9E9E9E] lg:flex">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.85-4.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
            <span>Search</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-full border border-[#9E9E9E]/40 p-2 text-[#212121] transition hover:border-[#007ACC] hover:text-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40 sm:inline-flex"
            aria-label="Theme toggle"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.364-6.364-1.414 1.414M8.05 15.95l-1.414 1.414m0-9.9L8.05 8.05m8.9 8.9 1.414 1.414M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="hidden rounded-full border border-[#9E9E9E]/40 p-2 text-[#212121] transition hover:border-[#007ACC] hover:text-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40 sm:inline-flex"
            aria-label="Language"
          >
            <span className="text-xs font-semibold">EN</span>
          </button>
          <button
            type="button"
            className="rounded-full border border-[#9E9E9E]/40 p-2 text-[#212121] transition hover:border-[#007ACC] hover:text-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40"
            aria-label="Messages"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 3v-10.5A7.5 7.5 0 0 1 10.5 5h3A7.5 7.5 0 0 1 21 12.5Z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="relative rounded-full border border-[#9E9E9E]/40 p-2 text-[#212121] transition hover:border-[#007ACC] hover:text-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40"
            aria-label="Notifications"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.5 17h-5m7-4v-3.5a4.5 4.5 0 0 0-9 0V13l-1.5 2h12l-1.5-2Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.5 17a2.5 2.5 0 0 0 5 0"
              />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4CAF50] text-[10px] font-semibold text-[#FFFFFF]">
              2
            </span>
          </button>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#9E9E9E]/40 p-1.5 text-sm text-[#212121] transition hover:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40">
              <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#007ACC]/10 text-sm font-semibold text-[#007ACC]">
                <img
                  src={resolvedAvatarUrl}
                  alt="User avatar"
                  className="h-9 w-9 object-cover"
                />
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-2 shadow-lg">
              <div className="px-3 py-2 text-xs text-[#9E9E9E]">
                {userDisplayName ? `Hello ${userDisplayName}` : 'Hello'}
              </div>
              <a
                href="/profile"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-[#212121] hover:bg-[#007ACC]/10"
              >
                Profile
              </a>
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-[#9E9E9E]"
                disabled
              >
                Settings
              </button>
              <div className="my-1 h-px bg-[#9E9E9E]/30" />
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-[#212121] hover:bg-[#007ACC]/10"
                >
                  Logout
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>
      <div className="border-t border-[#9E9E9E]/20 px-6 py-3">
        <h1 className="text-base font-semibold text-[#212121]">{title}</h1>
      </div>
    </header>
  )
}
