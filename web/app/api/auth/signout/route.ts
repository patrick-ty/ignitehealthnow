import { serverSignOut } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  await serverSignOut()

  return NextResponse.redirect(new URL('/login', request.url))
}
