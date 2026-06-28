// Copied from web/lib/supabase/client.ts — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
