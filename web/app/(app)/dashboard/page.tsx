// Auth is enforced by the (app) layout gate — this is a pure placeholder.
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-10 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-semibold text-[#212121]">
          Welcome to your dashboard
        </h2>
        <p className="text-sm text-[#9E9E9E]">
          Your health journaling features will appear here soon.
        </p>
        <div className="mt-6">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-[#9E9E9E]/15 px-3 py-1 text-sm font-medium text-[#9E9E9E]">
              Profile Setup
            </span>
            <p className="text-sm text-[#9E9E9E]">
              Complete your profile to personalize your experience.&nbsp;
              <a
                href="/profile/setup"
                className="font-medium text-[#007ACC] hover:underline"
              >
                Go to Profile Setup
              </a>
            </p>
          </div>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#212121]">Daily Journal</h3>
          <p className="mt-2 text-sm text-[#9E9E9E]">
            Track symptoms, mood, and habits. Coming soon.
          </p>
        </div>
        <div className="rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#212121]">Insights</h3>
          <p className="mt-2 text-sm text-[#9E9E9E]">
            Review trends and progress over time. Coming soon.
          </p>
        </div>
      </section>
    </div>
  )
}
