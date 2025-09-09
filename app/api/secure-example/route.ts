import { NextRequest } from 'next/server'
import { ApiValidator, ValidationRules } from '@/lib/api-validator'

/**
 * Secure API endpoint example for wallet risk score
 * Demonstrates proper input validation, authentication, and rate limiting
 */

export async function GET(request: NextRequest) {
  // Validate request with security checks
  const validation = await ApiValidator.validateRequest(request, {
    requireAuth: true, // Require authentication
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // Max 100 requests per 15 minutes
    },
    query: [
      ValidationRules.walletAddress, // Validate wallet address format
      {
        field: 'includeDetails',
        type: 'string',
        pattern: /^(true|false)$/,
      },
    ],
  })

  if (!validation.success) {
    return ApiValidator.createResponse(false, null, validation.error, 400)
  }

  try {
    const { address, includeDetails } = validation.data.query
    
    // Process the validated and sanitized data
    const riskData = await calculateRiskScore(address, includeDetails === 'true')
    
    return ApiValidator.createResponse(true, riskData)
    
  } catch (error) {
    console.error('Risk score calculation error:', error)
    return ApiValidator.createResponse(
      false,
      null,
      'Failed to calculate risk score',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  // Example POST endpoint with body validation
  const validation = await ApiValidator.validateRequest(request, {
    requireAuth: true,
    requireAdmin: true, // Admin only endpoint
    rateLimit: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // More restrictive for admin actions
    },
    body: [
      {
        field: 'addresses',
        type: 'array',
        required: true,
        customValidator: (addresses) => {
          // Validate array of wallet addresses
          if (!Array.isArray(addresses) || addresses.length === 0) return false
          if (addresses.length > 100) return false // Limit batch size
          
          return addresses.every(addr => 
            typeof addr === 'string' && 
            addr.length >= 32 && 
            addr.length <= 44
          )
        },
      },
      {
        field: 'priority',
        type: 'string',
        pattern: /^(low|medium|high|critical)$/,
      },
    ],
  })

  if (!validation.success) {
    return ApiValidator.createResponse(false, null, validation.error, 400)
  }

  try {
    const { addresses, priority } = validation.data.body
    
    // Process batch risk score calculation
    const results = await batchCalculateRiskScores(addresses, priority)
    
    return ApiValidator.createResponse(true, results)
    
  } catch (error) {
    console.error('Batch risk calculation error:', error)
    return ApiValidator.createResponse(
      false,
      null,
      'Failed to process batch risk calculation',
      500
    )
  }
}

// Mock implementation - replace with actual logic
async function calculateRiskScore(address: string, includeDetails: boolean) {
  // Simulate risk calculation
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const baseScore = Math.floor(Math.random() * 100)
  
  const result = {
    address,
    riskScore: baseScore,
    riskLevel: baseScore > 70 ? 'high' : baseScore > 40 ? 'medium' : 'low',
    lastUpdated: new Date().toISOString(),
  }
  
  if (includeDetails) {
    return {
      ...result,
      details: {
        transactionCount: Math.floor(Math.random() * 1000),
        volumeScore: Math.floor(Math.random() * 50),
        mixerInteraction: Math.random() > 0.8,
        exchangeVerified: Math.random() > 0.5,
      },
    }
  }
  
  return result
}

async function batchCalculateRiskScores(addresses: string[], priority: string) {
  // Mock batch processing
  const results = await Promise.all(
    addresses.map(address => calculateRiskScore(address, false))
  )
  
  return {
    processed: addresses.length,
    priority,
    results,
    batchId: crypto.randomUUID(),
  }
}