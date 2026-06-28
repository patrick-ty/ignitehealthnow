// Copied from web/components/auth/fields.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
'use client'

import { useState, type ReactNode } from 'react'

/* Shared auth form primitives, styled to the admin-console mockup:
   46px fields, left icon, accent focus ring, inline errors, strength meter. */

const fieldBase =
  'h-11 w-full rounded-[10px] border bg-white pl-11 pr-3 text-sm text-[#21323D] transition placeholder:text-[#aab8c1] focus:outline-none'
const fieldIdle =
  'border-[#E3EAEF] focus:border-accent focus:shadow-[0_0_0_3px_rgba(46,150,206,0.14)]'
const fieldError = 'border-[#DB6A5C] bg-[#FDF6F4]'

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">
      {children}
    </label>
  )
}

function LeftIcon({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aabb5]">
      {children}
    </span>
  )
}

export const MailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

export const LockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

type TextFieldProps = {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon: ReactNode
  error?: string
  autoComplete?: string
  required?: boolean
}

export function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  autoComplete,
  required,
}: TextFieldProps) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <LeftIcon>{icon}</LeftIcon>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`${fieldBase} ${error ? fieldError : fieldIdle}`}
        />
      </div>
      {error && <p className="mt-1.5 text-[11.5px] text-[#C8553D]">{error}</p>}
    </div>
  )
}

type PasswordFieldProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  required?: boolean
  /** Optional right-aligned control next to the label (e.g. "Forgot?"). */
  labelAccessory?: ReactNode
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required,
  labelAccessory,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[12.5px] font-semibold text-muted">
          {label}
        </label>
        {labelAccessory}
      </div>
      <div className="relative">
        <LeftIcon>{LockIcon}</LeftIcon>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`${fieldBase} !pr-11 ${error ? fieldError : fieldIdle}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#9aabb5] transition hover:text-muted"
        >
          {show ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l18 18M10.6 6.2A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3.3 3.9M6.5 8.5A16 16 0 0 0 2.5 12s3.5 6 9.5 6a9.6 9.6 0 0 0 3-.5" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11.5px] text-[#C8553D]">{error}</p>}
    </div>
  )
}

const STRENGTH = [
  { pct: 25, label: 'Weak', color: '#DB6A5C' },
  { pct: 25, label: 'Weak', color: '#DB6A5C' },
  { pct: 55, label: 'Fair', color: '#E0A33B' },
  { pct: 80, label: 'Good', color: '#7FB539' },
  { pct: 100, label: 'Strong', color: '#2E96CE' },
]

export function scorePassword(pw: string): number {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return <div className="mb-5 h-[5px]" aria-hidden />
  const s = STRENGTH[scorePassword(value)]
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#eef3f6]">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${s.pct}%`, background: s.color }}
        />
      </div>
      <span className="min-w-[42px] text-right text-[11px] font-semibold" style={{ color: s.color }}>
        {s.label}
      </span>
    </div>
  )
}

export function SubmitButton({
  loading,
  children,
}: {
  loading?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-accent text-sm font-semibold text-white shadow-[0_3px_12px_rgba(46,150,206,0.32)] transition hover:bg-accent-hover disabled:cursor-default disabled:bg-[#52A8D9]"
    >
      {loading ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" className="animate-spin">
          <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
        </svg>
      ) : (
        children
      )}
    </button>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="mb-4 rounded-[10px] border border-[#DB6A5C] bg-[#FDF6F4] px-4 py-2.5 text-[13px] text-[#C8553D]">
      {message}
    </div>
  )
}
