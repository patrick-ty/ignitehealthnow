import type { AdminContentPost } from '@/lib/api/client'
import ContentCard from './ContentCard'

export default function ContentColumn({
  title,
  color,
  posts,
  onAdd,
  onApprove,
  onReject,
  onEdit,
}: {
  title: string
  color: string
  posts: AdminContentPost[]
  onAdd: () => void
  onApprove: (p: AdminContentPost, scheduledFor: string | null) => void
  onReject: (p: AdminContentPost) => void
  onEdit: (p: AdminContentPost) => void
}) {
  const isAiDrafts = title === 'AI Drafts'

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <span
          className="h-2 w-2 shrink-0 rounded-sm"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span className="text-sm font-semibold text-[#3c4f59]">{title}</span>
        <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-muted">
          {posts.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {posts.map((p) => (
          <ContentCard
            key={p.id}
            post={p}
            onApprove={onApprove}
            onReject={onReject}
            onEdit={onEdit}
          />
        ))}
        {posts.length === 0 && (
          <p className="py-6 text-center text-xs text-faint">Nothing here yet</p>
        )}
      </div>

      {/* Footer add button */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 w-full rounded-xl border border-dashed border-line py-2 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
      >
        {isAiDrafts ? '+ Generate draft' : '+ Add'}
      </button>
    </div>
  )
}
