import { NextResponse, type NextRequest } from 'next/server'

// 로그인 없이 localStorage 모드로 운영 — 인증 미들웨어 비활성화
export function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
