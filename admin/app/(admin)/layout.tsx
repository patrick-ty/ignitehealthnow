import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/server'
import { resolveAccess } from '@/lib/auth/adminGuard'
import AdminShell from '@/components/layout/AdminShell'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerSession()
  if (!auth) redirect('/login')

  let me: { admin: boolean; email: string } | null = null
  try {
    const res = await fetch(`${API_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    })
    if (res.ok) me = await res.json()
  } catch {
    me = null
  }

  if (resolveAccess(me) === 'denied') redirect('/no-access')

  return <AdminShell email={me!.email}>{children}</AdminShell>
}
