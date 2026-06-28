import type { AdminContentPost } from '@/lib/api/client'

export default function ContentCard({
  post, onApprove, onReject, onEdit,
}: {
  post: AdminContentPost
  onApprove: (p: AdminContentPost, scheduledFor: string | null) => void
  onReject: (p: AdminContentPost) => void
  onEdit: (p: AdminContentPost) => void
}) {
  const canApprove = post.status === 'draft' || post.status === 'review'
  const canReject = post.status !== 'published' && post.status !== 'draft'
  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">{post.channel}</span>
        {post.scheduled_for && (
          <span className="text-[11px] text-faint">{new Date(post.scheduled_for).toLocaleString()}</span>
        )}
      </div>
      <p className="mb-3 text-sm text-[#2b3d47]">{post.caption}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onEdit(post)} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted hover:bg-page">Edit</button>
        {canApprove && (
          <button onClick={() => onApprove(post, null)} className="rounded-md bg-brand-now px-2.5 py-1 text-xs font-semibold text-white hover:brightness-95">Approve</button>
        )}
        {canReject && (
          <button onClick={() => onReject(post)} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-[#C8553D] hover:bg-page">Reject</button>
        )}
      </div>
    </div>
  )
}
