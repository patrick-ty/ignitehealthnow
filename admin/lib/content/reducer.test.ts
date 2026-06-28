import { describe, it, expect } from 'vitest'
import { contentReducer } from './reducer'
import type { AdminContentPost } from '@/lib/api/client'

const p = (id: string, caption = 'c'): AdminContentPost => ({
  id, channel: 'x', caption, hashtags: [], status: 'draft',
  scheduled_for: null, source: null, ai: false, why_it_works: null,
  created_at: '2026-06-27T00:00:00Z', updated_at: '2026-06-27T00:00:00Z',
})

describe('contentReducer', () => {
  it('set replaces all', () => {
    expect(contentReducer([], { type: 'set', posts: [p('a')] })).toHaveLength(1)
  })
  it('replace swaps by id, upsert adds when missing', () => {
    const s = contentReducer([p('a', 'old')], { type: 'replace', post: p('a', 'new') })
    expect(s[0].caption).toBe('new')
    expect(contentReducer(s, { type: 'upsert', post: p('b') })).toHaveLength(2)
  })
  it('remove drops by id', () => {
    expect(contentReducer([p('a'), p('b')], { type: 'remove', id: 'a' }).map((x) => x.id)).toEqual(['b'])
  })
})
