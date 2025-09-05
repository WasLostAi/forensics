import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from 'jose'

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be removed in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join('; '),
}

// List of routes that require authentication
const protectedRoutes = ["/dashboard", "/settings", "/investigations", "/entities/management"]

// List of routes that are only accessible to non-authenticated users
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password"]

// List of routes that require admin privileges
const adminRoutes = ["/admin", "/settings/api-keys"]

// Get admin wallet address from environment variable
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || ""

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Handle API routes with rate limiting
  if (pathname.startsWith('/api/')) {
    // TODO: Implement rate limiting here
    // For now, just add CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return response
  }

  try {
    // Get authentication token from HTTP-only cookie instead of localStorage
    const token = request.cookies.get('auth-token')?.value
    
    let isAuthenticated = false
    let walletAddress = ""
    let isAdmin = false

    if (token) {
      try {
        // Verify JWT token (in production, use a proper JWT secret)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
        const { payload } = await jwtVerify(token, secret)
        
        isAuthenticated = true
        walletAddress = payload.walletAddress as string
        isAdmin = walletAddress === ADMIN_WALLET_ADDRESS
      } catch (error) {
        // Invalid token, treat as unauthenticated
        console.warn('Invalid authentication token:', error)
      }
    }

    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Check if the route is only for non-authenticated users
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    // Check if the route requires admin privileges
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    // If the route requires admin privileges and the user is not an admin,
    // redirect to the dashboard
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If the route requires authentication and the user is not authenticated,
    // redirect to the sign-in page
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL("/auth/sign-in", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the route is only for non-authenticated users and the user is authenticated,
    // redirect to the dashboard
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}