'use client'

import type { Channel } from '@/lib/api/client'

type TabValue = 'all' | Channel

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All channels' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x', label: 'X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
]

export default function ChannelTabs({
  selected,
  onChange,
  count,
}: {
  selected: TabValue
  onChange: (v: TabValue) => void
  count: number
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((tab) => {
          const active = tab.value === selected
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={
                active
                  ? 'rounded-full border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent'
                  : 'rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:text-brand-ink'
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <span className="shrink-0 text-xs text-faint">{count} posts</span>
    </div>
  )
}
