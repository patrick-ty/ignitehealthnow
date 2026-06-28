// Copied from web/proxy.ts — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import { updateSession } from '@/lib/auth/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request)

  const p = request.nextUrl.pathname
  const isProtected =
    p === '/' ||
    p.startsWith('/content') ||
    p.startsWith('/today') ||
    p.startsWith('/overview') ||
    p.startsWith('/programs') ||
    p.startsWith('/members') ||
    p.startsWith('/reports') ||
    p.startsWith('/settings')

  if (!isAuthenticated && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default proxy
