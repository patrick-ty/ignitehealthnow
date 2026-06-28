// Copied from web/app/login/page.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/components/layout/AuthShell'
import {
  TextField,
  PasswordField,
  SubmitButton,
  FormError,
  MailIcon,
} from '@/components/auth/fields'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await authClient.signIn(email, password)
      if (error) throw new Error(error)

      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <AuthShell
      heading="Welcome back"
      sub="Sign in to ignitehealthnow."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-accent hover:text-accent-hover">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin}>
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

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          labelAccessory={
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-accent hover:text-accent-hover"
            >
              Forgot?
            </Link>
          }
        />

        <div className="mt-2">
          <SubmitButton loading={loading}>Sign in</SubmitButton>
        </div>
      </form>
    </AuthShell>
  )
}
