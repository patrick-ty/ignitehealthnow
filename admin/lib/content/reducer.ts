import type { AdminContentPost } from '@/lib/api/client'

export type ContentAction =
  | { type: 'set'; posts: AdminContentPost[] }
  | { type: 'upsert'; post: AdminContentPost }
  | { type: 'replace'; post: AdminContentPost }
  | { type: 'remove'; id: string }

export function contentReducer(state: AdminContentPost[], action: ContentAction): AdminContentPost[] {
  switch (action.type) {
    case 'set':
      return action.posts
    case 'replace':
      return state.map((p) => (p.id === action.post.id ? action.post : p))
    case 'upsert':
      return state.some((p) => p.id === action.post.id)
        ? state.map((p) => (p.id === action.post.id ? action.post : p))
        : [action.post, ...state]
    case 'remove':
      return state.filter((p) => p.id !== action.id)
    default:
      return state
  }
}
