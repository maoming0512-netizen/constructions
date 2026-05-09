import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api/') && pathname !== '/api/admin/stats') {
    const today = new Date().toISOString().split('T')[0]
    const url = new URL('/api/admin/stats', req.url)
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Stats-Subrequest': '1',
      },
      body: JSON.stringify({ type: 'api_call' }),
    }).catch(() => {})
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
