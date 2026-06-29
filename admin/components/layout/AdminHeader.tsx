import AdminHeaderActions from './AdminHeaderActions'

const KICKERS: Record<string, { kicker: string; title: string }> = {
  '/': { kicker: 'Overview', title: 'Today' },
  '/content': { kicker: 'Content', title: 'Content & Social' },
}

export default function AdminHeader({ pathname }: { pathname: string; email: string }) {
  const meta = KICKERS[pathname] ?? { kicker: 'Admin', title: 'Admin' }
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
      <div>
        <p className="kicker">{meta.kicker}</p>
        <h1 className="text-lg font-semibold text-brand-ink">{meta.title}</h1>
      </div>
      <AdminHeaderActions />
    </header>
  )
}
