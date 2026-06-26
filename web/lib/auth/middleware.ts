// Middleware auth adapter — encapsulates the Supabase-specific cookie refresh +
// auth check so proxy.ts stays provider-agnostic. To move to GCP later, swap
// this for next-firebase-auth-edge session-cookie verification.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export interface MiddlewareSession {
  response: NextResponse
  isAuthenticated: boolean
}

export async function updateSession(request: NextRequest): Promise<MiddlewareSession> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return { response, isAuthenticated: Boolean(user) && !error }
}
