import Link from 'next/link'

// Placeholder content modeled on the dashboard mockup (AI briefing, overview
// metrics, programs & cohorts). Static sample data — live analytics land in a
// later slice.

const METRICS = [
  { label: 'Active members', value: '1,248', delta: '+8% this week' },
  { label: 'Weekly check-in rate', value: '72%', delta: '+4 pts' },
  { label: 'Active programs', value: '6', delta: '2 starting soon' },
  { label: 'Posts scheduled', value: '9', delta: 'next 7 days' },
]

const TODAY = [
  'Review 3 AI-drafted posts awaiting approval',
  'Foundations cohort starts Monday — confirm the welcome sequence',
  'Member check-ins are up 8% — spotlight a few wins in this week’s digest',
]

const COHORTS = [
  { name: 'Foundations — June', members: 42, progress: 28 },
  { name: 'Metabolic Reset', members: 31, progress: 64 },
  { name: 'Sleep & Recovery', members: 19, progress: 12 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* AI briefing */}
      <section className="rounded-2xl border border-line bg-accent-soft px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="kicker text-accent">AI briefing</p>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted">
            Sample data
          </span>
        </div>
        <h2 className="mt-1 text-lg font-semibold text-brand-ink">Good morning — here’s where things stand.</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-body">
          Three posts are scheduled this week and engagement is trending up. The
          Foundations cohort kicks off Monday, and member check-ins rose 8% — a good
          moment to celebrate progress and keep momentum going.
        </p>
      </section>

      {/* Overview metrics */}
      <section>
        <p className="kicker mb-2 px-1">Overview</p>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-2xl border border-line bg-surface px-4 py-4">
              <p className="text-sm text-muted">{m.label}</p>
              <p className="mt-1 text-2xl font-semibold text-brand-ink">{m.value}</p>
              <p className="mt-1 text-xs font-medium text-brand-now">{m.delta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Today + Programs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="kicker">Today</p>
            <Link href="/content" className="text-xs font-semibold text-accent hover:text-accent-hover">
              Go to Content & Social →
            </Link>
          </div>
          <ul className="space-y-2.5">
            {TODAY.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-body">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface px-5 py-4">
          <p className="kicker mb-3">Programs &amp; cohorts</p>
          <div className="space-y-3.5">
            {COHORTS.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-ink">{c.name}</span>
                  <span className="text-xs text-muted">{c.members} members</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
