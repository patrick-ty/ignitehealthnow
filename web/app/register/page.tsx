'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/components/layout/AuthShell'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass =
    'mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30'

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.signUp(email, password)
      if (error) throw new Error(error)

      // Redirect to profile setup
      router.push('/profile/setup')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Ignite Health Now and start journaling your journey."
      topLinkHref="/login"
      topLinkLabel="Back to sign in"
      footer={
        <span>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#007ACC] hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-6" onSubmit={handleRegister}>
        {error && (
          <div className="rounded-md border border-[#9E9E9E]/40 bg-[#FFFFFF] px-4 py-3 text-sm text-[#212121]">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#212121]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-[#9E9E9E]">Must be at least 8 characters.</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#212121]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#007ACC] px-4 py-3 text-sm font-medium text-[#FFFFFF] shadow-sm transition hover:bg-[#0064A5] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
