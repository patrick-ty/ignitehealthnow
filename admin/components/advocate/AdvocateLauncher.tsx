// Copied from web/components/advocate/AdvocateLauncher.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
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
  // First-visit discovery hint (non-PHI UI flag only).
  // Lazy initializer: typeof window guard makes it SSR-safe; localStorage read is
  // a one-time external-state sync, not an effect that drives cascading renders.
  const [showHint, setShowHint] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !localStorage.getItem(SEEN_KEY)
    } catch {
      /* localStorage unavailable — skip hint */
      return false
    }
  })

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
