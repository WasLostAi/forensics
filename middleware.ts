import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

// List of routes that are accessible without authentication
const publicRoutes = [
  "/login",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
]

// List of routes that require admin privileges
const adminRoutes = ["/admin", "/settings/api-keys"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Create a Supabase client
  const supabase = createClient()

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Check for judge token in cookies
  const judgeToken = request.cookies.get("judge_access_token")?.value
  const isJudge = judgeToken === "judge-special-access-token"

  // Get wallet address from session if available
  const walletAddress = session?.user?.user_metadata?.wallet_address as string | undefined
  const isAdmin = walletAddress === "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"

  // Check if the route requires admin privileges
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // If the route requires admin privileges and the user is not an admin,
  // redirect to the dashboard
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the user is not authenticated and not a judge, redirect to the login page
  if (!isAuthenticated && !isJudge) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Otherwise, continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
