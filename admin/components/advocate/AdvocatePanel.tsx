// Copied from web/components/advocate/AdvocatePanel.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
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
          <div
            className="flex w-fit items-center gap-1.5 rounded-2xl bg-[#F5F9FC] px-4 py-3.5"
            role="status"
            aria-label="Advocate is thinking"
          >
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
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
            aria-label={loading ? 'Sending' : 'Send'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-accent text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="animate-spin">
                <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-faint">
          Educational, not a substitute for medical care.
        </p>
      </form>
    </section>
  )
}
