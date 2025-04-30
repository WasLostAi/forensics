import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

// List of routes that require authentication
const protectedRoutes = ["/dashboard", "/settings", "/investigations", "/entities/management"]

// List of routes that are only accessible to non-authenticated users
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a Supabase client
  const supabase = createClient()

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the route is only for non-authenticated users
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

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

  // Otherwise, continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
