import type { AdminContentPost, Status } from '@/lib/api/client'

export const COLUMNS: { status: Status; title: string; color: string }[] = [
  { status: 'draft', title: 'AI Drafts', color: '#102a3a' }, // brand-ink
  { status: 'review', title: 'In Review', color: '#e0744c' }, // warm
  { status: 'scheduled', title: 'Scheduled', color: '#2e96ce' }, // accent
  { status: 'published', title: 'Published', color: '#7fb539' }, // brand-now
]

export function groupByStatus(posts: AdminContentPost[]): Record<Status, AdminContentPost[]> {
  const out: Record<Status, AdminContentPost[]> = { draft: [], review: [], scheduled: [], published: [] }
  for (const p of posts) out[p.status].push(p)
  return out
}
