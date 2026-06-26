'use client'

// Browser auth adapter — Supabase implementation of AuthClient.
// To move to GCP later, replace the body of these methods with the Firebase
// SDK; consumers (pages, lib/api/client) import `authClient`, not Supabase.

import { createClient } from '@/lib/supabase/client'
import type { AuthClient, AuthResult } from './types'

class SupabaseAuthClient implements AuthClient {
  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { error } = await createClient().auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }

  async resetPassword(email: string, redirectTo: string): Promise<AuthResult> {
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo })
    return { error: error?.message ?? null }
  }

  async signOut(): Promise<void> {
    await createClient().auth.signOut()
  }

  async getToken(): Promise<string | null> {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? null
  }
}

export const authClient: AuthClient = new SupabaseAuthClient()
