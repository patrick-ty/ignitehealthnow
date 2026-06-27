'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api, type ChatMessage } from '@/lib/api/client'

// Style the model's markdown directly (no @tailwindcss/typography plugin — it
// doesn't resolve cleanly under Tailwind v4 + Turbopack here).
const md: Components = {
  h1: ({ children }) => (
    <h3 className="mt-5 mb-2 text-[17px] font-semibold tracking-tight text-[#212121] first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-5 mb-1.5 text-[15px] font-semibold tracking-tight text-[#212121] first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-4 mb-1 text-sm font-semibold text-[#37474F] first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="my-2 text-sm leading-relaxed text-[#37474F] first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-1 mb-3 list-disc space-y-1.5 pl-5 text-sm text-[#37474F] marker:text-[#007ACC]">{children}</ul>,
  ol: ({ children }) => <ol className="mt-1 mb-3 list-decimal space-y-1.5 pl-5 text-sm text-[#37474F] marker:text-[#9E9E9E]">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-[#212121]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-[#007ACC] underline-offset-2 hover:underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-md border-l-[3px] border-[#007ACC] bg-[#007ACC]/[0.06] px-4 py-2 text-sm leading-relaxed text-[#37474F] [&_p]:my-1">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-[#9E9E9E]/20" />,
  code: ({ children }) => (
    <code className="rounded bg-[#9E9E9E]/15 px-1 py-0.5 text-[13px] text-[#212121]">{children}</code>
  ),
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setError('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
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
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col">
      <h1 className="mb-4 text-xl font-semibold text-[#212121]">Ask your health companion</h1>

      <div className="flex-1 space-y-6 overflow-y-auto rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-5">
        {messages.length === 0 && (
          <p className="text-sm text-[#9E9E9E]">
            Ask about symptoms, labs, or what to discuss with your provider. This is
            educational and not a substitute for medical care.
          </p>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <span className="inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl bg-[#007ACC] px-4 py-2 text-sm text-white">
                {m.content}
              </span>
            </div>
          ) : (
            <div key={i} className="rounded-2xl bg-[#F5F9FC] px-5 py-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                {m.content}
              </ReactMarkdown>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#9E9E9E]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#007ACC]" />
            Thinking…
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Why am I tired even though my labs are normal?"
          className="flex-1 rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-[#007ACC] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0064A5] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
