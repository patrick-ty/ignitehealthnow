# Advocate Launcher — Design Spec

**Date:** 2026-06-28
**Status:** Approved design, pending implementation plan

## Goal

Replace the dedicated full-page Advocate chat (`/chat`) with a floating
launcher bubble available on every authenticated screen, so the data-aware
health advocate can be summoned in context and the awkward "blank chat page"
problem goes away.

## Context

The Advocate is the patient's conversational health companion: it draws on the
user's data, interprets patterns, helps prep for doctor visits, and educates —
always in plain language, never naming the underlying book/framework (existing
guardrail in `api/app/services/chat.py`). Today it lives at
`web/app/(app)/chat/page.tsx` as a centered full-height chat window reached via
an "Advocate" sidebar item. A whole page dedicated to a chat window feels
awkward and undersells a context-aware advocate.

This is a **web-only** change (Next.js dashboard). The Flutter app has its own
advocate surface and is out of scope here. No backend changes — the existing
`api.chat` endpoint and its guardrails are reused as-is.

## Decisions (locked)

- **Entry pattern:** floating launcher bubble (Intercom-style), sole entry point.
- **Nav/route:** remove the "Advocate" sidebar item and the `/chat` page entirely.
- **Button icon:** chat-with-spark glyph (the brand knot mark is reserved for
  brand lockups).
- **Persistence:** in-memory, lives in `AppShell`; survives in-app navigation,
  resets on full reload. Not written to localStorage (chat content is PHI).

## Architecture & Components

All new components live under `web/components/advocate/`. `AdvocateLauncher` is
mounted once in `web/components/layout/AppShell.tsx` (a client component that
persists across `(app)` route navigations), so the conversation state survives
moving between screens.

- **`AdvocateLauncher.tsx`** (client) — owns all state: `open` (panel
  visibility), `messages: ChatMessage[]`, `input`, `loading`, `error`, and the
  first-visit hint flag. Renders the fixed button + the `AdvocatePanel`. Holds
  the `send()` logic that calls `api.chat`. This is the only stateful unit.
- **`AdvocatePanel.tsx`** (client, presentational) — the panel surface: header,
  scrollable message list (with empty state), composer. Receives messages,
  loading, error, input value, and callbacks (`onSend`, `onInput`,
  `onPromptClick`, `onClose`) as props. No data fetching of its own.
- **`advocateMarkdown.tsx`** — the `react-markdown` `Components` map, ported
  from the current chat page and rebranded to the new design tokens (accent
  `#2E96CE`, ink `#102a3a`, body `#37474F`/muted). Exported so the panel renders
  assistant messages.
- **`prompts.ts`** — the suggested-prompt strings (data only).

### Removals

- Delete `web/app/(app)/chat/page.tsx`.
- Remove the Advocate/Chat item from the `navGroups` array in
  `web/components/layout/AppSidebar.tsx`.
- Remove the `/chat` entry from `titleMap` in
  `web/components/layout/AppShell.tsx`.

## Behavior

### Launcher button

- Fixed position, bottom-right, with safe-area margin (`bottom-6 right-6`,
  raised on mobile to clear OS bars). ~56px accent-blue circle, white
  chat-with-spark icon, soft shadow. Hover lifts slightly.
- Click toggles the panel. When open, the button shows a close (×) affordance
  or stays as-is with the panel's own close button (panel close is canonical).
- **First-visit discovery:** on first authenticated load, a gentle one-time
  pulse animation + a small "Meet your advocate" tooltip beside the button.
  Dismissed permanently once the panel is opened the first time. State stored in
  `localStorage` as a single boolean flag `ihn.advocate.seen` (a non-PHI UI
  preference — no chat content is persisted).

### Panel

- **Desktop (≥`lg`):** anchored above the button, ~384px wide, height
  `min(600px, 70vh)`, `rounded-2xl`, border `--color-line`, large shadow.
- **Mobile (<`lg`):** full-screen sheet (covers the viewport) so the composer
  and keyboard have room; slides up on open.
- **Header:** brand mark (small) + "Advocate" title + a one-line subtitle
  ("Your private health companion"); close button (×). On mobile the header is
  a top bar with the close button.
- **Dismissal:** ESC key and click/tap on the backdrop (desktop) close the
  panel. Closing preserves the conversation.
- **Messages:** user turns render as right-aligned accent bubbles; assistant
  turns render as left-aligned soft cards via `advocateMarkdown`. A pulsing
  "Thinking…" row shows while `loading`. Auto-scroll to newest on
  `messages`/`loading` change.
- **Composer:** single-line input (Enter to send) + send button, disabled while
  loading or empty; a one-line educational disclaimer beneath it ("Educational,
  not a substitute for medical care.").
- **Error:** inline error text above the composer if `api.chat` throws.

### Empty state

When `messages` is empty, the message area shows:

- A warm one-liner: "I can help you make sense of your health data, prep for
  appointments, and understand what your body's telling you."
- Four tappable prompt chips (from `prompts.ts`); tapping a chip sends it
  immediately:
  1. "Why am I still tired even though my labs are 'normal'?"
  2. "Help me prep for my next doctor's appointment"
  3. "What should I ask about my thyroid?"
  4. "Explain my latest lab results in plain language"
- The educational disclaimer.

## Data Flow

1. User opens panel → sees empty state or prior conversation.
2. User types / taps a chip → `AdvocateLauncher.send()` appends the user message,
   sets `loading`, calls `api.chat(next)`.
3. On success, appends the assistant reply; on failure, sets `error` and leaves
   the typed text recoverable.
4. State stays in `AdvocateLauncher` (in `AppShell`) across navigation; a full
   page reload clears it.

No new API surface. `api.chat` and the chat system-prompt guardrails are
unchanged.

## Accessibility

- Button has an `aria-label` ("Open health advocate"); panel uses
  `role="dialog"` + `aria-modal` on mobile full-screen, focus moves into the
  composer on open and returns to the button on close, ESC closes.
- Prompt chips are real `<button>`s; message list is scrollable and keyboard
  reachable.

## Error Handling

- Network/CORS failure from `api.chat` → inline error message in the panel; the
  conversation and the user's last input are preserved so they can retry.
- The launcher renders only inside `AppShell`, so it never appears on
  unauthenticated routes.

## Out of Scope (YAGNI)

- Server-side/persistent conversation history (separate advocate-memory feature).
- Streaming responses, multiple threads/conversations, attachments, voice.
- Changes to the chat backend, model, or guardrails.

## Testing

- Manual/Playwright verification on the running dev server: button appears on
  authenticated screens (and not on login/register); opening shows the empty
  state with chips; sending a message round-trips through `api.chat`; the
  conversation persists when navigating dashboard ↔ profile and clears on
  reload; ESC and backdrop close the panel; mobile width renders the full-screen
  sheet.
- Confirm the removed `/chat` route 404s and the sidebar no longer lists
  Advocate.
