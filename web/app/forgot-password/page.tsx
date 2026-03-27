'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/layout/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass =
    'mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists, we’ll send a reset link shortly."
        topLinkHref="/login"
        topLinkLabel="Back to sign in"
      >
        <div className="space-y-4 text-sm text-[#9E9E9E]">
          <p>
            We sent a reset link to <span className="font-medium text-[#212121]">{email}</span>.
          </p>
          <p>Please check your spam folder if you don&apos;t see it.</p>
          <Link href="/login" className="text-sm font-medium text-[#007ACC] hover:underline">
            Return to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a reset link."
      topLinkHref="/login"
      topLinkLabel="Back to sign in"
      footer={
        <span>
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-[#007ACC] hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md border border-[#9E9E9E]/40 bg-[#FFFFFF] px-4 py-3 text-sm text-[#212121]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#212121]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#007ACC] px-4 py-3 text-sm font-medium text-[#FFFFFF] shadow-sm transition hover:bg-[#0064A5] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  )
}
