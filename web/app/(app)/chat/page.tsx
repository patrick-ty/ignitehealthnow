'use client'

import { useState } from 'react'
import { api, type ChatMessage } from '@/lib/api/client'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-4">
        {messages.length === 0 && (
          <p className="text-sm text-[#9E9E9E]">
            Ask about symptoms, labs, or what to discuss with your provider. This is
            educational and not a substitute for medical care.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-[#007ACC] text-white'
                  : 'bg-[#007ACC]/10 text-[#212121]'
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-left text-sm text-[#9E9E9E]">Thinking…</p>}
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
