// Copied from web/lib/auth/server.ts — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
// Server auth adapter — Supabase implementation of the server-side session.
// Used by the protected layout and the signout route. To move to GCP later,
// reimplement these against Firebase session cookies (next-firebase-auth-edge);
// consumers call getServerSession()/serverSignOut(), not Supabase.

import { createClient } from '@/lib/supabase/server'
import type { AuthSession } from './types'

export async function getServerSession(): Promise<AuthSession | null> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!session?.access_token || !user) return null
  return { userId: user.id, token: session.access_token }
}

export async function serverSignOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
