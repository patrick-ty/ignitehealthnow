'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/layout/AuthShell'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass =
    'mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Let’s keep your health journey on track."
      topLinkHref="/register"
      topLinkLabel="Create account"
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[#007ACC] hover:underline">
            Create account
          </Link>
        </span>
      }
    >
      <div className="rounded-lg border border-[#007ACC]/20 bg-[#FFFFFF] p-4 text-sm text-[#212121]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#007ACC]">Test account</p>
        <div className="mt-2 space-y-1 text-sm">
          <p className="break-words">
            Email: <span className="font-mono text-xs">patrick.ty@comcast.net</span>
          </p>
          <p className="break-words">
            Password: <span className="font-mono text-xs">nIwboz-8vetju-cysbon</span>
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
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
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-[#007ACC] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#007ACC] px-4 py-3 text-sm font-medium text-[#FFFFFF] shadow-sm transition hover:bg-[#0064A5] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}
