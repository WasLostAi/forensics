import { NextRequest, NextResponse } from 'next/server'
import { SecureAuth } from './auth-secure'

export interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'email' | 'wallet' | 'array'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean
}

export interface ApiValidationOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimit?: {
    windowMs?: number
    maxRequests?: number
  }
  body?: ValidationRule[]
  query?: ValidationRule[]
  headers?: ValidationRule[]
}

export class ApiValidator {
  /**
   * Validate API request with security checks
   */
  static async validateRequest(
    request: NextRequest,
    options: ApiValidationOptions = {}
  ): Promise<{ success: boolean; user?: any; error?: string; data?: any }> {
    try {
      // Rate limiting check
      if (options.rateLimit) {
        const clientIP = this.getClientIP(request)
        const rateLimitKey = `${clientIP}_${request.nextUrl.pathname}`
        
        if (!SecureAuth.checkRateLimit(
          rateLimitKey,
          options.rateLimit.windowMs,
          options.rateLimit.maxRequests
        )) {
          return { success: false, error: 'Rate limit exceeded' }
        }
      }

      // Authentication check
      let user = null
      if (options.requireAuth) {
        user = await SecureAuth.getCurrentUser(request)
        if (!user) {
          return { success: false, error: 'Authentication required' }
        }
      }

      // Admin authorization check
      if (options.requireAdmin) {
        if (!user || !SecureAuth.isAdmin(user)) {
          return { success: false, error: 'Admin privileges required' }
        }
      }

      // Validate request body
      let bodyData = null
      if (options.body && request.method !== 'GET') {
        try {
          bodyData = await request.json()
          const bodyValidation = this.validateData(bodyData, options.body)
          if (!bodyValidation.success) {
            return { success: false, error: `Body validation error: ${bodyValidation.error}` }
          }
          bodyData = bodyValidation.data
        } catch (error) {
          return { success: false, error: 'Invalid JSON in request body' }
        }
      }

      // Validate query parameters
      let queryData = null
      if (options.query) {
        const searchParams = request.nextUrl.searchParams
        queryData = Object.fromEntries(searchParams.entries())
        const queryValidation = this.validateData(queryData, options.query)
        if (!queryValidation.success) {
          return { success: false, error: `Query validation error: ${queryValidation.error}` }
        }
        queryData = queryValidation.data
      }

      // Validate headers
      if (options.headers) {
        const headers = Object.fromEntries(request.headers.entries())
        const headerValidation = this.validateData(headers, options.headers)
        if (!headerValidation.success) {
          return { success: false, error: `Header validation error: ${headerValidation.error}` }
        }
      }

      return {
        success: true,
        user,
        data: {
          body: bodyData,
          query: queryData,
        },
      }
    } catch (error) {
      console.error('Request validation error:', error)
      return { success: false, error: 'Request validation failed' }
    }
  }

  /**
   * Validate data against rules
   */
  private static validateData(
    data: any,
    rules: ValidationRule[]
  ): { success: boolean; error?: string; data?: any } {
    const validatedData: any = {}

    for (const rule of rules) {
      const value = data[rule.field]

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        return { success: false, error: `Field '${rule.field}' is required` }
      }

      // Skip validation for optional empty fields
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue
      }

      // Type validation
      const typeValidation = this.validateType(value, rule)
      if (!typeValidation.success) {
        return { success: false, error: `Field '${rule.field}': ${typeValidation.error}` }
      }

      // Length validation for strings
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          return { success: false, error: `Field '${rule.field}' must be at least ${rule.minLength} characters` }
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          return { success: false, error: `Field '${rule.field}' must be at most ${rule.maxLength} characters` }
        }
      }

      // Number range validation
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          return { success: false, error: `Field '${rule.field}' must be at least ${rule.min}` }
        }
        if (rule.max !== undefined && value > rule.max) {
          return { success: false, error: `Field '${rule.field}' must be at most ${rule.max}` }
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          return { success: false, error: `Field '${rule.field}' format is invalid` }
        }
      }

      // Custom validation
      if (rule.customValidator && !rule.customValidator(value)) {
        return { success: false, error: `Field '${rule.field}' failed custom validation` }
      }

      // Sanitize and store validated value
      validatedData[rule.field] = this.sanitizeValue(value, rule.type)
    }

    return { success: true, data: validatedData }
  }

  /**
   * Validate value type
   */
  private static validateType(value: any, rule: ValidationRule): { success: boolean; error?: string } {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { success: false, error: 'must be a string' }
        }
        break

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { success: false, error: 'must be a valid number' }
        }
        break

      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return { success: false, error: 'must be a valid email address' }
        }
        break

      case 'wallet':
        if (typeof value !== 'string' || !SecureAuth.isValidSolanaAddress(value)) {
          return { success: false, error: 'must be a valid Solana wallet address' }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          return { success: false, error: 'must be an array' }
        }
        break

      default:
        return { success: false, error: 'unknown validation type' }
    }

    return { success: true }
  }

  /**
   * Sanitize value based on type
   */
  private static sanitizeValue(value: any, type: string): any {
    switch (type) {
      case 'string':
        return SecureAuth.sanitizeInput(value)
      case 'email':
        return value.toLowerCase().trim()
      case 'wallet':
        return value.trim()
      default:
        return value
    }
  }

  /**
   * Check if email is valid
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return 'unknown'
  }

  /**
   * Create standardized API response
   */
  static createResponse(
    success: boolean,
    data?: any,
    error?: string,
    status = 200
  ): NextResponse {
    const response = NextResponse.json(
      {
        success,
        data: success ? data : undefined,
        error: !success ? error : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: success ? status : (status === 200 ? 400 : status) }
    )

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
  }
}

// Export validation rules for common use cases
export const ValidationRules = {
  walletAddress: {
    field: 'address',
    type: 'wallet' as const,
    required: true,
  },
  pagination: [
    {
      field: 'page',
      type: 'number' as const,
      min: 1,
      max: 1000,
    },
    {
      field: 'limit',
      type: 'number' as const,
      min: 1,
      max: 100,
    },
  ],
  dateRange: [
    {
      field: 'startDate',
      type: 'string' as const,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    {
      field: 'endDate',
      type: 'string' as const,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
  ],
}