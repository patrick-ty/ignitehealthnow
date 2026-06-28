// Copied from web/app/api/auth/signout/route.ts — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import { serverSignOut } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  await serverSignOut()

  return NextResponse.redirect(new URL('/login', request.url))
}
