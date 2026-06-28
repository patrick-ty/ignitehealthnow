// Auth is enforced by the (app) layout gate — this is a pure placeholder.
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line bg-accent-soft px-8 py-10 text-center">
          <p className="kicker">Welcome</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-brand-ink">
            Welcome to your dashboard
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your health journaling features will appear here soon.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 px-8 py-6 text-center">
          <span className="inline-flex items-center rounded-full bg-brand-now-soft px-3 py-1 text-xs font-semibold text-brand-now">
            Profile Setup
          </span>
          <p className="text-sm text-muted">
            Complete your profile to personalize your experience.&nbsp;
            <a
              href="/profile/setup"
              className="font-medium text-accent hover:text-accent-hover hover:underline"
            >
              Go to Profile Setup
            </a>
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h3 className="font-serif text-base font-semibold text-brand-ink">
            Daily Journal
          </h3>
          <p className="mt-2 text-sm text-muted">
            Track symptoms, mood, and habits. Coming soon.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h3 className="font-serif text-base font-semibold text-brand-ink">
            Insights
          </h3>
          <p className="mt-2 text-sm text-muted">
            Review trends and progress over time. Coming soon.
          </p>
        </div>
      </section>
    </div>
  )
}
