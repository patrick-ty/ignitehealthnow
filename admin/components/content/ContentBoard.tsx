'use client'

import { useEffect, useReducer, useState } from 'react'
import { api, type AdminContentPost, type AdminContentCreate, type AdminContentUpdate, type Channel } from '@/lib/api/client'
import { COLUMNS, groupByStatus } from '@/lib/content/board'
import { contentReducer } from '@/lib/content/reducer'
import ContentColumn from './ContentColumn'
import ContentComposer from './ContentComposer'
import AiBanner from './AiBanner'
import ChannelTabs from './ChannelTabs'

type ChannelFilter = 'all' | Channel

export default function ContentBoard() {
  const [posts, dispatch] = useReducer(contentReducer, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<AdminContentPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [channel, setChannel] = useState<ChannelFilter>('all')

  useEffect(() => {
    api.listContentPosts()
      .then((p) => dispatch({ type: 'set', posts: p }))
      .catch(() => setError('Could not load posts.'))
      .finally(() => setLoading(false))
  }, [])

  // Listen for the header "+ New post" button
  useEffect(() => {
    const handler = () => setCreating(true)
    window.addEventListener('admin:new-post', handler)
    return () => window.removeEventListener('admin:new-post', handler)
  }, [])

  // Optimistic helper: apply locally, call API, replace with server row, rollback on error.
  const optimistic = async (
    prev: AdminContentPost,
    next: AdminContentPost,
    call: () => Promise<AdminContentPost>,
  ) => {
    setError('')
    dispatch({ type: 'replace', post: next })
    try {
      dispatch({ type: 'replace', post: await call() })
    } catch {
      dispatch({ type: 'replace', post: prev })
      setError('That change didn’t save. Please retry.')
    }
  }

  const approve = (p: AdminContentPost, scheduledFor: string | null) =>
    optimistic(
      p,
      { ...p, status: scheduledFor ? 'scheduled' : p.status === 'draft' ? 'review' : p.status, scheduled_for: scheduledFor ?? p.scheduled_for },
      () => api.approveContentPost(p.id, { scheduled_for: scheduledFor }),
    )

  const reject = (p: AdminContentPost) =>
    optimistic(p, { ...p, status: 'draft' }, () => api.rejectContentPost(p.id))

  const saveEdit = async (id: string, body: AdminContentUpdate, scheduleIso: string | null) => {
    const prev = posts.find((p) => p.id === id)!
    const next = {
      ...prev,
      ...body,
      ...(scheduleIso ? { status: 'scheduled' as const, scheduled_for: scheduleIso } : {}),
    } as AdminContentPost
    await optimistic(prev, next, async () => {
      const patched = await api.updateContentPost(id, body)
      return scheduleIso ? api.approveContentPost(id, { scheduled_for: scheduleIso }) : patched
    })
    setEditing(null)
  }

  const create = async (body: AdminContentCreate) => {
    setError('')
    try {
      dispatch({ type: 'upsert', post: await api.createContentPost(body) })
      setCreating(false)
    } catch {
      setError('Could not create the post.')
    }
  }

  // Filter by channel before grouping
  const filteredPosts = channel === 'all' ? posts : posts.filter((p) => p.channel === channel)
  const grouped = groupByStatus(filteredPosts)

  return (
    <div>
      <AiBanner />

      <ChannelTabs selected={channel} onChange={setChannel} count={filteredPosts.length} />

      {error && <p className="mb-3 rounded-lg bg-warm-soft px-3 py-2 text-sm text-warm">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <ContentColumn
              key={col.status}
              title={col.title}
              color={col.color}
              posts={grouped[col.status]}
              onAdd={() => setCreating(true)}
              onApprove={approve}
              onReject={reject}
              onEdit={setEditing}
            />
          ))}
        </div>
      )}
      {(creating || editing) && (
        <ContentComposer
          post={editing}
          onClose={() => { setCreating(false); setEditing(null) }}
          onCreate={create}
          onSave={saveEdit}
        />
      )}
    </div>
  )
}
