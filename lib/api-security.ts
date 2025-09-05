import { NextRequest, NextResponse } from "next/server"
import { rateLimit, validateApiRequest, logSecurityEvent } from "./security"

// Security middleware for API routes
export function withSecurity(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      const rateLimitResult = rateLimit(request)
      if (!rateLimitResult.success) {
        logSecurityEvent("rate_limit", {
          ip: request.ip || "unknown",
          path: request.nextUrl.pathname,
          userAgent: request.headers.get("user-agent"),
        })
        
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            }
          }
        )
      }

      // Validate request
      const validationResult = validateApiRequest(request)
      if (!validationResult.valid) {
        logSecurityEvent("invalid_input", {
          ip: request.ip || "unknown",
          path: request.nextUrl.pathname,
          error: validationResult.error,
        })
        
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        )
      }

      // Add security headers to response
      const response = await handler(request)
      
      response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      
      return response
    } catch (error) {
      logSecurityEvent("api_error", {
        ip: request.ip || "unknown",
        path: request.nextUrl.pathname,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}