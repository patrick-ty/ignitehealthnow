'use client'

import { useState } from 'react'
import type { AdminContentPost, AdminContentCreate, AdminContentUpdate, Channel } from '@/lib/api/client'

const CHANNELS: Channel[] = ['instagram', 'x', 'linkedin', 'facebook']

export default function ContentComposer({
  post, onClose, onCreate, onSave,
}: {
  post: AdminContentPost | null
  onClose: () => void
  onCreate: (body: AdminContentCreate) => void
  onSave: (id: string, body: AdminContentUpdate, scheduleIso: string | null) => void
}) {
  const [channel, setChannel] = useState<Channel>(post?.channel ?? 'instagram')
  const [caption, setCaption] = useState(post?.caption ?? '')
  const [scheduledFor, setScheduledFor] = useState(post?.scheduled_for ? post.scheduled_for.slice(0, 16) : '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const iso = scheduledFor ? new Date(scheduledFor).toISOString() : null
    if (post) onSave(post.id, { channel, caption }, iso)
    else onCreate({ channel, caption })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-brand-ink/30" onClick={onClose} aria-hidden />
      <form onSubmit={submit} className="relative flex h-full w-[420px] max-w-[92vw] flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold text-brand-ink">{post ? 'Edit post' : 'New post'}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-brand-ink">✕</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted">Channel</label>
            <div className="flex gap-2">
              {CHANNELS.map((c) => (
                <button key={c} type="button" onClick={() => setChannel(c)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${channel === c ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted">Caption</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} required
              className="min-h-[120px] w-full rounded-lg border border-line bg-white p-3 text-sm text-[#2b3d47] focus:border-accent focus:outline-none" />
          </div>
          {post && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted">Schedule (optional)</label>
              <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full rounded-lg border border-line bg-white p-2 text-sm text-[#2b3d47] focus:border-accent focus:outline-none" />
              <p className="mt-1 text-[11px] text-faint">Setting a time schedules the post on save.</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line py-2 text-sm font-semibold text-muted hover:bg-page">Cancel</button>
          <button type="submit" disabled={!caption.trim()} className="flex-[1.6] rounded-lg bg-accent py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50">
            {post ? 'Save changes' : 'Create draft'}
          </button>
        </div>
      </form>
    </div>
  )
}
