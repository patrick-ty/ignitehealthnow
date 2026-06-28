// Copied from web/app/register/page.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/components/layout/AuthShell'
import {
  TextField,
  PasswordField,
  PasswordStrength,
  SubmitButton,
  FormError,
  MailIcon,
} from '@/components/auth/fields'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setExists(false)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error, alreadyRegistered, needsConfirmation } = await authClient.signUp(
        email,
        password
      )

      // Existing-email shows up two ways depending on project config: an explicit
      // "User already registered" error, or an anti-enumeration "fake success"
      // (no error, no session). Steer both to the friendly sign-in prompt instead
      // of a raw error or a silent bounce off the protected route.
      const emailTaken =
        alreadyRegistered ||
        (!!error && /already (registered|exists|been registered)/i.test(error))

      if (emailTaken) {
        setExists(true)
        setLoading(false)
        return
      }

      if (error) throw new Error(error)

      if (needsConfirmation) {
        setError('Check your email to confirm your account before signing in.')
        setLoading(false)
        return
      }

      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <AuthShell
      heading="Create your account"
      sub="Start your private health journal with ignitehealthnow."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister}>
        <FormError message={error} />

        {exists && (
          <div className="mb-4 rounded-[10px] border border-[#E3EAEF] bg-accent-soft px-4 py-3 text-[13px] text-brand-ink">
            An account with this email already exists.{' '}
            <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
              Sign in instead
            </Link>
            .
          </div>
        )}

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

        <div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
          <PasswordStrength value={password} />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
        />

        <div className="mt-2">
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </div>
      </form>
    </AuthShell>
  )
}
