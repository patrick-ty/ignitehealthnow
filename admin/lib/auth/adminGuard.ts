import type { AdminMe } from '@/lib/api/client'

export function resolveAccess(me: AdminMe | null): 'ok' | 'denied' {
  return me?.admin ? 'ok' : 'denied'
}
