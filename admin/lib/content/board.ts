import type { AdminContentPost, Status } from '@/lib/api/client'

export const COLUMNS: { status: Status; title: string }[] = [
  { status: 'draft', title: 'Draft' },
  { status: 'review', title: 'In Review' },
  { status: 'scheduled', title: 'Scheduled' },
  { status: 'published', title: 'Published' },
]

export function groupByStatus(posts: AdminContentPost[]): Record<Status, AdminContentPost[]> {
  const out: Record<Status, AdminContentPost[]> = { draft: [], review: [], scheduled: [], published: [] }
  for (const p of posts) out[p.status].push(p)
  return out
}
