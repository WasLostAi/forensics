// Security validation utilities
import { NextRequest } from "next/server"

// Simple in-memory rate limiting (for demo purposes)
// In production, use Redis or a proper rate limiting service
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export function rateLimit(
  request: NextRequest,
  limit = 60, // requests per minute
  windowMs = 60 * 1000 // 1 minute
): { success: boolean; remaining: number } {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()
  
  const record = rateLimitMap.get(ip)
  
  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return { success: true, remaining: limit - 1 }
  }
  
  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }
  
  record.count++
  return { success: true, remaining: limit - record.count }
}

// Validate Solana address format
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and typically 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

// Validate transaction signature format
export function isValidSolanaSignature(signature: string): boolean {
  // Solana transaction signatures are base58 encoded and typically 87-88 characters
  return /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(signature)
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 200) // Limit length
}

// Validate API request headers
export function validateApiRequest(request: NextRequest): { valid: boolean; error?: string } {
  const contentType = request.headers.get("content-type")
  const userAgent = request.headers.get("user-agent")
  
  // Check for suspicious patterns
  if (userAgent && /bot|crawler|spider/i.test(userAgent)) {
    return { valid: false, error: "Bot traffic not allowed" }
  }
  
  // Validate content type for POST requests
  if (request.method === "POST" && contentType && !contentType.includes("application/json")) {
    return { valid: false, error: "Invalid content type" }
  }
  
  return { valid: true }
}

// Simple request logging for security monitoring
export function logSecurityEvent(
  type: "rate_limit" | "invalid_input" | "auth_failure" | "api_error",
  details: Record<string, any>
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    type,
    ...details,
  }
  
  // In production, send to proper logging service
  console.warn("[SECURITY]", JSON.stringify(logEntry))
}