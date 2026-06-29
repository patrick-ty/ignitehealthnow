import type { AdminContentPost } from '@/lib/api/client'

// Sample reviewer/approver names — stable hash by post.id (clearly sample data)
const SAMPLE_NAMES = ['Maya Chen, RD', 'Avery Reed', 'Dr. R. Shah', 'Lena Ortiz', 'A. Park, NP']

// Sample reach/open metrics for published posts (sample/static)
const SAMPLE_METRICS = ['4.1k reach', '38% open', '2.8k reach', '52% open', '1.9k reach']

function stableIndex(id: string, len: number): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return hash % len
}

function formatScheduled(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export default function ContentCard({
  post,
  onApprove,
  onReject,
  onEdit,
}: {
  post: AdminContentPost
  onApprove: (p: AdminContentPost, scheduledFor: string | null) => void
  onReject: (p: AdminContentPost) => void
  onEdit: (p: AdminContentPost) => void
}) {
  const canApprove = post.status === 'draft' || post.status === 'review'
  const canReject = post.status !== 'published' && post.status !== 'draft'

  const reviewerName = SAMPLE_NAMES[stableIndex(post.id, SAMPLE_NAMES.length)]
  const metricText = SAMPLE_METRICS[stableIndex(post.id + 'm', SAMPLE_METRICS.length)]

  const statusLine =
    post.status === 'published'
      ? `Published · ${reviewerName}`
      : post.status === 'scheduled'
        ? `Scheduled · ${reviewerName}`
        : `Needs review · ${reviewerName}`

  return (
    <div
      className="group cursor-pointer rounded-xl border border-line bg-surface p-3 shadow-sm transition hover:shadow-md"
      onClick={() => onEdit(post)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(post)
        }
      }}
    >
      {/* Top row: channel chip + AI chip + date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 rounded-md bg-page px-2 py-0.5 text-[11px] font-medium capitalize text-muted">
            {post.channel}
          </span>
          {post.ai && (
            <span className="shrink-0 rounded-md bg-[#efeafc] px-1.5 py-0.5 text-[10px] font-semibold text-[#6d5ae0]">
              ✦ AI
            </span>
          )}
        </div>
        <span className="shrink-0 whitespace-nowrap text-[11px] text-faint">
          {post.scheduled_for ? formatScheduled(post.scheduled_for) : '— no date'}
        </span>
      </div>

      {/* Caption */}
      <p className="mt-2 line-clamp-3 text-sm text-brand-ink">{post.caption}</p>

      {/* Provenance */}
      {post.source && (
        <p className="mt-2 text-[11px] text-faint">↘ Drafted from {post.source}</p>
      )}

      {/* Footer: reviewer avatar + status | metric */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[9px] font-semibold text-accent">
            {initials(reviewerName)}
          </span>
          <span className="truncate text-[11px] text-muted">{statusLine}</span>
        </div>
        {post.status === 'published' && (
          <span className="ml-2 shrink-0 text-[11px] text-faint">{metricText}</span>
        )}
      </div>

      {/* Hover actions */}
      <div
        className="mt-2 flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(post)
          }}
          className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-page"
        >
          Edit
        </button>
        {canApprove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onApprove(post, null)
            }}
            className="rounded-md bg-brand-now px-2.5 py-1 text-xs font-semibold text-white transition hover:brightness-95"
          >
            Approve
          </button>
        )}
        {canReject && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onReject(post)
            }}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-warm transition hover:bg-page"
          >
            Reject
          </button>
        )}
      </div>
    </div>
  )
}
