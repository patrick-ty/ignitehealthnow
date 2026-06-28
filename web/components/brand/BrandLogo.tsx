'use client'

import { useState, type CSSProperties } from 'react'

/**
 * IgniteHealthNow brand mark — the white interlocking knot inside a rounded
 * accent-blue square.
 *
 * Uses the production asset at `/brand/knot-white.png` (a transparent white
 * knot) when present, and falls back to an inline SVG placeholder when the
 * file is missing — so dropping the real logo into `web/public/brand/` makes
 * it appear everywhere with no code change.
 */
export function BrandMark({
  size = 36,
  className,
  background = 'var(--color-accent)',
  border,
}: {
  size?: number
  className?: string
  /** Square background; defaults to brand accent. Use a translucent tone on dark panels. */
  background?: string
  /** Optional border, e.g. on translucent dark backgrounds. */
  border?: string
}) {
  const [useFallback, setUseFallback] = useState(false)
  const radius = Math.round(size * 0.28)
  const glyph = Math.round(size * 0.68)
  return (
    <span
      className={className}
      style={
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: radius,
          background,
          border,
        } as CSSProperties
      }
      aria-hidden
    >
      {useFallback ? (
        <svg viewBox="0 0 64 64" width={glyph} height={glyph} fill="none">
          <g
            stroke="#ffffff"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* placeholder interlocking loops — replaced by the real asset */}
            <path d="M32 33C25 24 15 27 16 36c1 8 12 9 16 1" />
            <path d="M32 31c7 9 17 6 16-3-1-8-12-9-16-1" />
          </g>
        </svg>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/knot-white.png"
          width={glyph}
          height={glyph}
          alt=""
          style={{ display: 'block', objectFit: 'contain' }}
          onError={() => setUseFallback(true)}
        />
      )}
    </span>
  )
}

/**
 * Full wordmark lockup: "ignitehealth" (serif, ink) + "now" (serif italic,
 * brand green). Pass `tone="onDark"` to render the text in white over a
 * dark/accent surface.
 */
export function BrandWordmark({
  tone = 'default',
  className,
}: {
  tone?: 'default' | 'onDark'
  className?: string
}) {
  const base = tone === 'onDark' ? '#ffffff' : 'var(--color-brand-ink)'
  // Lighter green reads better on the dark blue panel; standard green on light.
  const now = tone === 'onDark' ? '#CFEE8E' : 'var(--color-brand-now)'
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.25rem',
        lineHeight: 1,
        letterSpacing: '-0.01em',
      }}
    >
      <span style={{ color: base, fontWeight: 600 }}>ignitehealth</span>
      <span style={{ color: now, fontWeight: 500, fontStyle: 'italic' }}>now</span>
    </span>
  )
}

/** Mark + wordmark side by side — the standard app header lockup. */
export function BrandLogo({
  size = 36,
  tone = 'default',
  className,
}: {
  size?: number
  tone?: 'default' | 'onDark'
  className?: string
}) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <BrandMark size={size} />
      <BrandWordmark tone={tone} />
    </span>
  )
}
