import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Skip middleware for the root path and public assets
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/login")
  ) {
    return NextResponse.next()
  }

  // For demonstration purposes, we'll just check if there's a mock auth token
  // In a real app, you'd verify the session/token
  const hasAuthToken = request.cookies.has("auth-token")

  // If no auth token is present, redirect to login
  if (!hasAuthToken) {
    // Create a URL object for the login page using the request URL as the base
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
