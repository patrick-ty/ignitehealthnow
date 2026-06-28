# Advocate Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dedicated `/chat` page with a floating Advocate launcher bubble available on every authenticated screen.

**Architecture:** A single stateful `AdvocateLauncher` (mounted once in `AppShell`) owns the open/conversation state and calls the existing `api.chat`; a presentational `AdvocatePanel` renders the surface (header, messages, empty-state prompt chips, composer). A shared markdown map and a prompts list are extracted as their own modules. The old chat page, its sidebar nav item, and its title entry are removed.

**Tech Stack:** Next.js 16 (App Router) client components, Tailwind v4 (brand tokens in `web/app/globals.css`), `react-markdown` + `remark-gfm` (already installed).

## Global Constraints

- Web-only change; no backend/API changes. Reuse `api.chat(messages: ChatMessage[]): Promise<ChatReply>` from `web/lib/api/client.ts` verbatim. `ChatMessage = { role: 'user' | 'assistant'; content: string }`.
- Light theme only; use existing brand tokens (`bg-accent` `#2E96CE`, `accent-hover` `#1F7DB0`, `accent-soft`, `text-brand-ink` `#102a3a`, `text-muted`, `text-faint`, `border-line`, `bg-page`, `bg-surface`).
- Conversation state is **in-memory only** — never write chat content to localStorage (PHI). The only localStorage key permitted is the non-PHI UI flag `ihn.advocate.seen`.
- Never name the book/framework in UI copy (the API guardrail already enforces this in responses; do not add any "book"/"framework"/"sources" UI).
- No new test runner — the web app has none. Verify each task with `npx tsc --noEmit` and `npx eslint <files>` (both must exit clean), plus Playwright smoke checks where noted. Run all commands from `web/`.
- All four components are client components (`'use client'`) except the data/markdown modules.

---

### Task 1: Prompts + rebranded markdown map

**Files:**
- Create: `web/components/advocate/prompts.ts`
- Create: `web/components/advocate/advocateMarkdown.tsx`

**Interfaces:**
- Produces: `ADVOCATE_PROMPTS: string[]`; `advocateMarkdown: Components` (a `react-markdown` components map).

- [ ] **Step 1: Create the prompts module**

`web/components/advocate/prompts.ts`:
```ts
// Suggested entry prompts shown in the Advocate empty state. Patient-facing,
// aligned to the advocate's purpose (data sense-making, visit prep, education).
export const ADVOCATE_PROMPTS: string[] = [
  "Why am I still tired even though my labs are 'normal'?",
  'Help me prep for my next doctor’s appointment',
  'What should I ask about my thyroid?',
  'Explain my latest lab results in plain language',
]
```

- [ ] **Step 2: Create the rebranded markdown map**

`web/components/advocate/advocateMarkdown.tsx` (ported from the current chat page, recolored to brand tokens):
```tsx
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
```

- [ ] **Step 3: Verify clean**

Run from `web/`: `npx tsc --noEmit && npx eslint components/advocate/prompts.ts components/advocate/advocateMarkdown.tsx`
Expected: both exit 0, no output.

- [ ] **Step 4: Commit**
```bash
git add web/components/advocate/prompts.ts web/components/advocate/advocateMarkdown.tsx
git commit -m "feat(web): advocate prompts + rebranded markdown map"
```

---

### Task 2: AdvocatePanel (presentational surface)

**Files:**
- Create: `web/components/advocate/AdvocatePanel.tsx`

**Interfaces:**
- Consumes: `ADVOCATE_PROMPTS` and `advocateMarkdown` (Task 1); `ChatMessage` from `@/lib/api/client`; `BrandMark` from `@/components/brand/BrandLogo`.
- Produces: default export `AdvocatePanel` with props
  `{ messages: ChatMessage[]; input: string; loading: boolean; error: string; onInput: (v: string) => void; onSend: () => void; onPromptClick: (prompt: string) => void; onClose: () => void }`.

- [ ] **Step 1: Create the panel**

`web/components/advocate/AdvocatePanel.tsx`:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type ChatMessage } from '@/lib/api/client'
import { BrandMark } from '@/components/brand/BrandLogo'
import { advocateMarkdown } from './advocateMarkdown'
import { ADVOCATE_PROMPTS } from './prompts'

type AdvocatePanelProps = {
  messages: ChatMessage[]
  input: string
  loading: boolean
  error: string
  onInput: (v: string) => void
  onSend: () => void
  onPromptClick: (prompt: string) => void
  onClose: () => void
}

export default function AdvocatePanel({
  messages,
  input,
  loading,
  error,
  onInput,
  onSend,
  onPromptClick,
  onClose,
}: AdvocatePanelProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend()
  }

  return (
    <section
      role="dialog"
      aria-label="Health advocate"
      className="fixed inset-0 z-50 flex flex-col bg-surface shadow-2xl lg:inset-auto lg:bottom-24 lg:right-6 lg:h-[min(600px,70vh)] lg:w-[384px] lg:rounded-2xl lg:border lg:border-line"
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <BrandMark size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-ink">Advocate</p>
          <p className="text-xs text-faint">Your private health companion</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-page hover:text-brand-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-[#37474F]">
              I can help you make sense of your health data, prep for appointments,
              and understand what your body’s telling you.
            </p>
            <div className="space-y-2">
              {ADVOCATE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPromptClick(p)}
                  className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-left text-sm text-brand-ink transition hover:border-accent hover:bg-accent-soft"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <span className="inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl bg-accent px-4 py-2 text-sm text-white">
                  {m.content}
                </span>
              </div>
            ) : (
              <div key={i} className="rounded-2xl bg-[#F5F9FC] px-4 py-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={advocateMarkdown}>
                  {m.content}
                </ReactMarkdown>
              </div>
            )
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-faint">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-line px-3 py-3">
        {error && <p className="mb-2 px-1 text-xs text-[#C8553D]">{error}</p>}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => onInput(e.target.value)}
            placeholder="Ask your advocate…"
            autoFocus
            className="h-11 flex-1 rounded-[10px] border border-[#E3EAEF] bg-white px-3 text-sm text-[#21323D] transition placeholder:text-[#aab8c1] focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(46,150,206,0.14)]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-accent text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-faint">
          Educational, not a substitute for medical care.
        </p>
      </form>
    </section>
  )
}
```

- [ ] **Step 2: Verify clean**

Run from `web/`: `npx tsc --noEmit && npx eslint components/advocate/AdvocatePanel.tsx`
Expected: both exit 0.

- [ ] **Step 3: Commit**
```bash
git add web/components/advocate/AdvocatePanel.tsx
git commit -m "feat(web): advocate panel surface (presentational)"
```

---

### Task 3: AdvocateLauncher + mount in AppShell

**Files:**
- Create: `web/components/advocate/AdvocateLauncher.tsx`
- Modify: `web/components/layout/AppShell.tsx` (add import + render `<AdvocateLauncher />`)

**Interfaces:**
- Consumes: `AdvocatePanel` (Task 2); `api`, `ChatMessage` from `@/lib/api/client`.
- Produces: default export `AdvocateLauncher` (no props).

- [ ] **Step 1: Create the launcher**

`web/components/advocate/AdvocateLauncher.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { api, type ChatMessage } from '@/lib/api/client'
import AdvocatePanel from './AdvocatePanel'

const SEEN_KEY = 'ihn.advocate.seen'

export default function AdvocateLauncher() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHint, setShowHint] = useState(false)

  // First-visit discovery hint (non-PHI UI flag only).
  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShowHint(true)
    } catch {
      /* localStorage unavailable — skip hint */
    }
  }, [])

  // ESC closes the panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const openPanel = () => {
    setOpen(true)
    if (showHint) {
      setShowHint(false)
      try {
        localStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* ignore */
      }
    }
  }

  const sendText = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setError('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const { reply } = await api.chat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-brand-ink/20 lg:bg-transparent"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {open && (
        <AdvocatePanel
          messages={messages}
          input={input}
          loading={loading}
          error={error}
          onInput={setInput}
          onSend={() => sendText(input)}
          onPromptClick={sendText}
          onClose={() => setOpen(false)}
        />
      )}

      {!open && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {showHint && (
            <span className="hidden rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-brand-ink shadow-md ring-1 ring-line sm:block">
              Meet your advocate
            </span>
          )}
          <button
            type="button"
            onClick={openPanel}
            aria-label="Open health advocate"
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent-hover ${
              showHint ? 'animate-pulse' : ''
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5c-1.2 0-2.3-.25-3.3-.7L4 20l1.2-4.2A7.5 7.5 0 1 1 20 11.5Z" />
              <path d="M12 8.4l.72 1.88 1.88.72-1.88.72L12 13.6l-.72-1.88-1.88-.72 1.88-.72z" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Mount the launcher in AppShell**

In `web/components/layout/AppShell.tsx`, add the import near the other component imports:
```tsx
import AdvocateLauncher from '@/components/advocate/AdvocateLauncher'
```
Then render it once inside the outer wrapper, immediately before the closing `</div>` of the root element (so it overlays all authenticated screens). The end of the component's returned JSX becomes:
```tsx
          <main className="flex-1 px-6 py-6">
            {children}
          </main>
        </div>
      </div>
      <AdvocateLauncher />
    </div>
  )
}
```
(The `<AdvocateLauncher />` sits as the last child of the top-level `<div className="min-h-screen bg-page text-body">`.)

- [ ] **Step 3: Verify clean**

Run from `web/`: `npx tsc --noEmit && npx eslint components/advocate/AdvocateLauncher.tsx components/layout/AppShell.tsx`
Expected: both exit 0.

- [ ] **Step 4: Playwright smoke check**

With the dev server running (`npm run dev`, port 4000) and signed in:
- Navigate to `/dashboard` → the bubble appears bottom-right; navigate to `/login` (sign out first) → bubble absent.
- Click the bubble → panel opens with the empty state + 4 prompt chips.
- Click a chip → it sends; a "Thinking…" row shows, then an assistant card renders.
- Type a follow-up and send → conversation grows.
- Navigate `/dashboard` ↔ `/profile` with the panel closed, reopen → the conversation is still there.
- Press ESC and click the backdrop → panel closes, conversation preserved.
Expected: all behaviors hold; no console errors except a 404 for `/brand/knot-white.png` (placeholder fallback).

- [ ] **Step 5: Commit**
```bash
git add web/components/advocate/AdvocateLauncher.tsx web/components/layout/AppShell.tsx
git commit -m "feat(web): floating advocate launcher mounted in app shell"
```

---

### Task 4: Remove the old chat page, nav item, and title entry

**Files:**
- Delete: `web/app/(app)/chat/page.tsx`
- Modify: `web/components/layout/AppSidebar.tsx` (remove the Advocate nav item)
- Modify: `web/components/layout/AppShell.tsx` (remove the `/chat` title entry)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing; this task only removes the superseded surface.

- [ ] **Step 1: Delete the chat page**
```bash
git rm web/app/(app)/chat/page.tsx
```

- [ ] **Step 2: Remove the Advocate nav item**

In `web/components/layout/AppSidebar.tsx`, in the `navGroups` array, delete the entire `Advocate` item object from the `'Today'` group (the object with `label: 'Advocate', href: '/chat'` and its `icon`). The `'Today'` group then contains only the `Dashboard` item:
```tsx
  {
    heading: 'Today',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: icon(
          <>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </>,
        ),
      },
    ],
  },
```

- [ ] **Step 3: Remove the `/chat` title entry**

In `web/components/layout/AppShell.tsx`, delete the `'/chat'` line from `titleMap`:
```tsx
const titleMap: Record<string, { title: string; kicker: string }> = {
  '/dashboard': { title: 'Dashboard', kicker: 'Overview' },
  '/profile': { title: 'Profile', kicker: 'Account' },
  '/profile/setup': { title: 'Profile Setup', kicker: 'Account' },
  '/journal': { title: 'Journal', kicker: 'Tracking' },
  '/insights': { title: 'Insights', kicker: 'Trends' },
}
```

- [ ] **Step 4: Verify clean**

Run from `web/`: `npx tsc --noEmit && npx eslint components/layout/AppSidebar.tsx components/layout/AppShell.tsx`
Expected: both exit 0. Confirm no remaining references to `/chat`:
`grep -rn "'/chat'" app components` → no results.

- [ ] **Step 5: Playwright smoke check**
- Sidebar no longer lists "Advocate".
- Navigating to `/chat` directly renders the app's not-found (no page).

- [ ] **Step 6: Commit**
```bash
git add -A web/components/layout/AppSidebar.tsx web/components/layout/AppShell.tsx
git commit -m "refactor(web): remove standalone chat page in favor of advocate launcher"
```

---

## Self-Review

**Spec coverage:** entry button + first-visit hint (Task 3), panel desktop/mobile + header + messages + composer + disclaimer (Task 2), empty state + 4 prompts (Tasks 1–2), in-memory persistence via AppShell mount (Task 3), no-localStorage-for-chat + `ihn.advocate.seen` flag (Task 3), `api.chat` reuse with no backend change (Task 3), removals (Task 4), accessibility (dialog role, aria-labels, ESC, focus via `autoFocus`) (Tasks 2–3). All spec sections map to a task.

**Placeholder scan:** none — every code step is complete.

**Type consistency:** `AdvocatePanel` prop names/types in Task 2 exactly match the props passed by `AdvocateLauncher` in Task 3 (`messages/input/loading/error/onInput/onSend/onPromptClick/onClose`). `ChatMessage` and `api.chat` used as defined in `web/lib/api/client.ts`. `ADVOCATE_PROMPTS`/`advocateMarkdown` names consistent across Tasks 1–2.
