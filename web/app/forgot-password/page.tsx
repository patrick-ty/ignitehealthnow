'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/components/layout/AuthShell'
import { TextField, SubmitButton, FormError, MailIcon } from '@/components/auth/fields'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await authClient.resetPassword(
        email,
        `${window.location.origin}/reset-password`
      )
      if (error) throw new Error(error)
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
      <AuthShell heading="" sub="">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-[62px] w-[62px] items-center justify-center rounded-[18px] bg-[#f0f6e4]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7FB539" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
              <path d="m16 16 2.5 2.5L23 14" stroke="#5d8226" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.4px] text-brand-ink">Check your inbox</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#7e909b]">
            We sent a reset link to{' '}
            <span className="font-semibold text-[#33454f]">{email}</span>. It expires in 30 minutes.
          </p>
          <Link
            href="/login"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-[10px] border border-[#E3EAEF] bg-white text-sm font-semibold text-[#33454f] transition hover:border-[#cdd9e0] hover:bg-[#f8fafb]"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      heading="Reset your password"
      sub="Enter your email and we’ll send a secure link to reset your password."
      back={{ href: '/login', label: 'Back to sign in' }}
    >
      <form onSubmit={handleSubmit}>
        <FormError message={error} />
        <TextField
          id="email"
          label="Email"
          type="email"
          icon={MailIcon}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <div className="mt-2">
          <SubmitButton loading={loading}>Send reset link</SubmitButton>
        </div>
      </form>
    </AuthShell>
  )
}
