// Provider-agnostic auth contract (Port E from the auth provider contract spec).
// Feature/UI code depends on these interfaces, never on @supabase/* directly,
// so swapping to GCP Identity Platform later only touches the adapter files
// in this directory.

export interface AuthSession {
  /** Opaque provider user id (Supabase auth.users.id today; Firebase UID later). */
  userId: string
  /** Bearer token for authenticated API calls. */
  token: string
}

export interface AuthResult {
  /** Human-readable error message, or null on success. */
  error: string | null
}

export interface AuthClient {
  signIn(email: string, password: string): Promise<AuthResult>
  signUp(email: string, password: string): Promise<AuthResult>
  resetPassword(email: string, redirectTo: string): Promise<AuthResult>
  signOut(): Promise<void>
  /** Current access token for API calls, or null if unauthenticated. */
  getToken(): Promise<string | null>
}
