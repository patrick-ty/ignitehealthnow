import { describe, it, expect } from 'vitest'
import { groupByStatus, COLUMNS } from './board'
import type { AdminContentPost } from '@/lib/api/client'

const post = (id: string, status: AdminContentPost['status']): AdminContentPost => ({
  id, channel: 'x', caption: 'c', hashtags: [], status,
  scheduled_for: null, source: null, ai: false, why_it_works: null,
  created_at: '2026-06-27T00:00:00Z', updated_at: '2026-06-27T00:00:00Z',
})

describe('groupByStatus', () => {
  it('buckets posts into all four columns', () => {
    const g = groupByStatus([post('a', 'draft'), post('b', 'scheduled'), post('c', 'draft')])
    expect(g.draft.map((p) => p.id)).toEqual(['a', 'c'])
    expect(g.scheduled.map((p) => p.id)).toEqual(['b'])
    expect(g.review).toEqual([])
    expect(COLUMNS.map((c) => c.status)).toEqual(['draft', 'review', 'scheduled', 'published'])
  })
})
