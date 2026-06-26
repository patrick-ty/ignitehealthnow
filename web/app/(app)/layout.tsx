import AppShell from '@/components/layout/AppShell'
import { getServerSession } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerSession()

  if (!auth) {
    redirect('/login')
  }

  let profile:
    | { user_id?: string | null; display_name?: string | null; avatar_url?: string | null }
    | null = null

  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json()
      profile = {
        user_id: data?.user_id ?? null,
        display_name: data?.display_name ?? null,
        avatar_url: data?.avatar_url ?? null,
      }
    }
  } catch {
    profile = null
  }

  if (profile?.display_name && typeof profile.display_name === 'string') {
    const trimmed = profile.display_name.trim()
    profile.display_name = trimmed.length ? trimmed : null
  }

  return (
    <AppShell profile={profile} fallbackUserId={auth.userId}>
      {children}
    </AppShell>
  )
}
