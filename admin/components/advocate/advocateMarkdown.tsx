// Copied from web/components/advocate/advocateMarkdown.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import type { Components } from 'react-markdown'

// Styles the model's markdown directly (no @tailwindcss/typography plugin — it
// doesn't resolve cleanly under Tailwind v4 + Turbopack here).
export const advocateMarkdown: Components = {
  h1: ({ children }) => (
    <h3 className="mt-5 mb-2 text-[17px] font-semibold tracking-tight text-brand-ink first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-5 mb-1.5 text-[15px] font-semibold tracking-tight text-brand-ink first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-4 mb-1 text-sm font-semibold text-[#37474F] first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="my-2 text-sm leading-relaxed text-[#37474F] first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-1 mb-3 list-disc space-y-1.5 pl-5 text-sm text-[#37474F] marker:text-accent">{children}</ul>,
  ol: ({ children }) => <ol className="mt-1 mb-3 list-decimal space-y-1.5 pl-5 text-sm text-[#37474F] marker:text-faint">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-brand-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">{children}</a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-md border-l-[3px] border-accent bg-accent-soft px-4 py-2 text-sm leading-relaxed text-[#37474F] [&_p]:my-1">{children}</blockquote>
  ),
  hr: () => <hr className="my-4 border-line" />,
  code: ({ children }) => (
    <code className="rounded bg-[#eef3f6] px-1 py-0.5 text-[13px] text-brand-ink">{children}</code>
  ),
}
