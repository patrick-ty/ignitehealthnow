'use client'

const SearchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const CalendarIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const BellIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export default function AdminHeaderActions() {
  const handleNewPost = () => {
    window.dispatchEvent(new CustomEvent('admin:new-post'))
  }

  return (
    <div className="flex items-center gap-2">
      {/* Decorative search */}
      <div className="relative hidden md:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
          {SearchIcon}
        </span>
        <input
          type="text"
          readOnly
          placeholder="Search members, posts…"
          className="h-9 w-64 cursor-default rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-muted placeholder:text-faint focus:outline-none"
        />
      </div>

      {/* Decorative date range button */}
      <button
        type="button"
        aria-label="Date range"
        tabIndex={-1}
        className="hidden h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm text-muted hover:bg-page md:flex"
      >
        <span className="text-faint">{CalendarIcon}</span>
        <span>Last 12 weeks</span>
      </button>

      {/* Decorative bell */}
      <button
        type="button"
        aria-label="Notifications"
        tabIndex={-1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-page"
      >
        {BellIcon}
      </button>

      {/* New post — real action */}
      <button
        type="button"
        onClick={handleNewPost}
        className="h-9 rounded-lg bg-brand-ink px-4 text-sm font-semibold text-white transition hover:opacity-90"
      >
        + New post
      </button>
    </div>
  )
}
