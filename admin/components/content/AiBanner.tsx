export default function AiBanner() {
  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#f4f1fb] px-6 py-4">
      {/* Left: icon + text */}
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl bg-[#6d5ae0] text-lg text-white">
          ✦
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-ink">
            ignitehealthnow AI drafts your posts automatically
          </p>
          <p className="mt-0.5 max-w-2xl text-xs text-muted">
            Generated from clinician notes, member milestones, and your content library.
            Review, edit, and approve to publish — nothing goes out without your sign-off.
          </p>
        </div>
      </div>

      {/* Right: status pill */}
      <span className="ml-6 shrink-0 rounded-full bg-brand-now-soft px-3 py-1 text-xs font-medium text-[#5a8a1f]">
        ● Auto-drafting on
      </span>
    </div>
  )
}
