// Copied from web/app/api/auth/signout/route.ts — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import { serverSignOut } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  await serverSignOut()

  // Behind Cloud Run, request.url is the internal bind address (0.0.0.0:8080),
  // so build the redirect from the forwarded host/proto to target the public origin.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const base = host ? `${proto}://${host}` : new URL(request.url).origin

  return NextResponse.redirect(new URL('/login', base), { status: 303 })
}
