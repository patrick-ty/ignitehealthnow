import type { AdminContentPost } from '@/lib/api/client'
import ContentCard from './ContentCard'

export default function ContentColumn({
  title, posts, onApprove, onReject, onEdit,
}: {
  title: string
  posts: AdminContentPost[]
  onApprove: (p: AdminContentPost, scheduledFor: string | null) => void
  onReject: (p: AdminContentPost) => void
  onEdit: (p: AdminContentPost) => void
}) {
  return (
    <div className="rounded-2xl bg-[#eef3f6] p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-sm font-semibold text-[#3c4f59]">{title}</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{posts.length}</span>
      </div>
      <div className="space-y-2">
        {posts.map((p) => (
          <ContentCard key={p.id} post={p} onApprove={onApprove} onReject={onReject} onEdit={onEdit} />
        ))}
        {posts.length === 0 && <p className="px-1 py-6 text-center text-xs text-faint">Nothing here yet</p>}
      </div>
    </div>
  )
}
