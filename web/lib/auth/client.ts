'use client'

// Browser auth adapter — Supabase implementation of AuthClient.
// To move to GCP later, replace the body of these methods with the Firebase
// SDK; consumers (pages, lib/api/client) import `authClient`, not Supabase.

import { createClient } from '@/lib/supabase/client'
import type { AuthClient, AuthResult, SignUpResult } from './types'

class SupabaseAuthClient implements AuthClient {
  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async signUp(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await createClient().auth.signUp({ email, password })
    if (error) return { error: error.message }

    // Supabase anti-enumeration: signing up an email that already exists returns
    // an obfuscated user with an empty `identities` array and no session, instead
    // of an error. Detect that so the UI can steer the user to sign in.
    const alreadyRegistered =
      !!data.user && (data.user.identities?.length ?? 0) === 0 && !data.session

    return {
      error: null,
      alreadyRegistered,
      needsConfirmation: !alreadyRegistered && !data.session,
    }
  }

  async resetPassword(email: string, redirectTo: string): Promise<AuthResult> {
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo })
    return { error: error?.message ?? null }
  }

  async updatePassword(password: string): Promise<AuthResult> {
    const { error } = await createClient().auth.updateUser({ password })
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
