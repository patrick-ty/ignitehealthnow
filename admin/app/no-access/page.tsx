import Link from 'next/link'

export default function NoAccess() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6 text-center">
      <h1 className="text-xl font-semibold text-brand-ink">No admin access</h1>
      <p className="max-w-sm text-sm text-muted">
        This account isn't on the admin allowlist. If that's a mistake, ask an existing admin to add you.
      </p>
      <form action="/api/auth/signout" method="post">
        <button className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted hover:bg-surface">
          Sign out
        </button>
      </form>
      <Link href="/login" className="text-sm text-accent">Back to sign in</Link>
    </main>
  )
}
