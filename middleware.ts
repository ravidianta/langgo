import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

const protectedRoutes = ['/dashboard', '/lessons', '/admin', '/learn', '/character-select']
const adminRoutes = ['/admin']
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAdmin = adminRoutes.some(r => pathname.startsWith(r))
  const isAuthPage = authRoutes.some(r => pathname.startsWith(r))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const { payload } = await jwtVerify(token, getSecret())
      if (isAdmin && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isAuthPage && token) {
    try {
      await jwtVerify(token, getSecret())
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // invalid token, let them through
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}