// Copied from web/app/reset-password/page.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/components/layout/AuthShell'
import {
  PasswordField,
  PasswordStrength,
  SubmitButton,
  FormError,
} from '@/components/auth/fields'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // The recovery link drops a session into the client (via detectSessionInUrl).
  // Poll briefly for it; if none appears, the link is missing/expired.
  useEffect(() => {
    let active = true
    const check = async (attempt = 0) => {
      const token = await authClient.getToken()
      if (!active) return
      if (token) {
        setReady(true)
        setChecking(false)
        return
      }
      if (attempt < 3) {
        setTimeout(() => check(attempt + 1), 700)
        return
      }
      setChecking(false)
    }
    check()
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await authClient.updatePassword(password)
    if (error) {
      setError(error)
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  if (checking) {
    return (
      <AuthShell heading="Reset your password" sub="Verifying your reset link…">
        <div className="flex justify-center py-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E96CE" strokeWidth="2.4" className="animate-spin">
            <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
          </svg>
        </div>
      </AuthShell>
    )
  }

  if (!ready) {
    return (
      <AuthShell
        heading="Link expired"
        sub="This password reset link is invalid or has expired."
        back={{ href: '/login', label: 'Back to sign in' }}
      >
        <Link
          href="/forgot-password"
          className="flex h-11 w-full items-center justify-center rounded-[10px] bg-accent text-sm font-semibold text-white shadow-[0_3px_12px_rgba(46,150,206,0.32)] transition hover:bg-accent-hover"
        >
          Request a new link
        </Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell heading="Password updated" sub="Signing you in…">
        <div className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-[18px] bg-[#f0f6e4]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7FB539" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell heading="Set a new password" sub="Choose a strong password for your account.">
      <form onSubmit={handleSubmit}>
        <FormError message={error} />
        <div>
          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
          <PasswordStrength value={password} />
        </div>
        <PasswordField
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
        />
        <div className="mt-2">
          <SubmitButton loading={loading}>Update password</SubmitButton>
        </div>
      </form>
    </AuthShell>
  )
}
