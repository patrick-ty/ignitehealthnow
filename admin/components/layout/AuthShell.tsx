// Copied from web/components/layout/AuthShell.tsx — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import Link from 'next/link'
import type { ReactNode } from 'react'

import { BrandMark, BrandWordmark } from '@/components/brand/BrandLogo'

type AuthShellProps = {
  heading: string
  sub: string
  children: ReactNode
  footer?: ReactNode
  /** Optional "back" link shown above the heading (e.g. on the reset flow). */
  back?: { href: string; label: string }
}

/**
 * Two-panel auth layout adopted from the admin-console mockup, adapted for the
 * patient app: a calm blue brand panel on the left and a focused form column on
 * the right. The brand panel is hidden on small screens, where a compact logo
 * appears above the form instead.
 */
export default function AuthShell({ heading, sub, children, footer, back }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white text-[#21323D]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex lg:basis-[46%] lg:max-w-[620px] bg-[linear-gradient(157deg,#3AA3D6_0%,#2E96CE_42%,#1E76A9_100%)]">
        <div className="pointer-events-none absolute -left-28 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -right-28 h-[420px] w-[420px] rounded-full bg-white/[0.04]" />

        <div className="relative flex items-center gap-3">
          <BrandMark size={42} background="rgba(13,42,58,0.28)" border="1px solid rgba(255,255,255,0.22)" />
          <BrandWordmark tone="onDark" />
        </div>

        <div className="relative max-w-[430px]">
          <p className="kicker !text-white/70">Ignite Health Now</p>
          <h1 className="mt-5 font-serif text-[2.35rem] font-medium leading-[1.18] tracking-[-0.5px] text-balance">
            Track your health with clarity.
          </h1>
          <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-white/80">
            A calm, private space for your health history, habits, and insights — and a
            partner that helps you advocate for yourself.
          </p>
        </div>

        <div className="relative flex items-center gap-4 font-mono text-[11px] tracking-[0.08em] text-white/65">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CFEE8E]" />
            PRIVATE BY DESIGN
          </span>
          <span className="opacity-40">·</span>
          <span>ENCRYPTED</span>
          <span className="opacity-40">·</span>
          <span>YOURS</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto bg-[#FBFCFD] px-7 py-10">
        <div className="w-full max-w-[384px]">
          {/* Compact logo for small screens (brand panel hidden) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandMark size={34} />
            <BrandWordmark />
          </div>

          {back && (
            <Link
              href={back.href}
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#7e909b] transition hover:text-[#33454f]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              {back.label}
            </Link>
          )}

          <h2 className="text-[26px] font-semibold tracking-[-0.5px] text-brand-ink">{heading}</h2>
          <p className="mb-7 mt-1.5 text-sm text-[#7e909b]">{sub}</p>

          {children}

          {footer && (
            <p className="mt-6 text-center text-[13.5px] text-[#7e909b]">{footer}</p>
          )}
        </div>
      </div>
    </div>
  )
}
