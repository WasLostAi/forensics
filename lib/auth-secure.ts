import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Get configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production'
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || ''

export interface AuthUser {
  walletAddress: string
  role: 'admin' | 'user'
  sessionId: string
}

export class SecureAuth {
  private static getJWTSecret(): Uint8Array {
    return new TextEncoder().encode(JWT_SECRET)
  }

  /**
   * Generate a cryptographically secure random token
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Create a secure JWT token for authentication
   */
  static async createAuthToken(walletAddress: string): Promise<string> {
    const role = walletAddress === ADMIN_WALLET_ADDRESS ? 'admin' : 'user'
    const sessionId = this.generateSecureToken()

    const token = await new SignJWT({
      walletAddress,
      role,
      sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .setIssuer('forensics-app')
      .setAudience('forensics-users')
      .sign(this.getJWTSecret())

    return token
  }

  /**
   * Verify and decode a JWT token
   */
  static async verifyAuthToken(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify(token, this.getJWTSecret(), {
        issuer: 'forensics-app',
        audience: 'forensics-users',
      })

      return {
        walletAddress: payload.walletAddress as string,
        role: payload.role as 'admin' | 'user',
        sessionId: payload.sessionId as string,
      }
    } catch (error) {
      console.warn('Token verification failed:', error)
      return null
    }
  }

  /**
   * Set secure authentication cookie
   */
  static setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })
  }

  /**
   * Clear authentication cookie
   */
  static clearAuthCookie(response: NextResponse): void {
    response.cookies.delete('auth-token')
  }

  /**
   * Get current user from request
   */
  static async getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    return this.verifyAuthToken(token)
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: AuthUser | null): boolean {
    return user?.role === 'admin'
  }

  /**
   * Validate wallet address format (basic Solana address validation)
   */
  static isValidSolanaAddress(address: string): boolean {
    // Basic validation for Solana addresses (32-44 characters, base58)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    return base58Regex.test(address)
  }

  /**
   * Hash password securely (for future use if needed)
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  /**
   * Verify password hash (for future use if needed)
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === verifyHash
  }

  /**
   * Rate limiting helper (basic implementation)
   */
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(identifier: string, windowMs = 15 * 60 * 1000, maxRequests = 100): boolean {
    const now = Date.now()
    const record = this.rateLimitStore.get(identifier)

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }

  /**
   * Input sanitization helper
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .substring(0, 1000) // Limit length
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64')
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(token: string, sessionToken: string): boolean {
    // In a real implementation, you would store and verify CSRF tokens properly
    // This is a simplified version
    return token.length === 44 && token === sessionToken
  }
}

// Export types
export type { AuthUser }