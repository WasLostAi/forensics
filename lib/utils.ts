import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Combine class names safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format SOL amount - MISSING EXPORT
export function formatSol(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) {
    return "0 SOL"
  }

  return (
    amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }) + " SOL"
  )
}

// Safely shorten an address with proper validation
export function shortenAddress(address: string, chars = 4): string {
  if (!address || typeof address !== "string") {
    return ""
  }

  if (address.length <= chars * 2) {
    return address
  }

  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

// Format currency values safely
export function formatCurrency(value: number | string, currency = "SOL", decimals = 4): string {
  if (value === undefined || value === null) {
    return `0 ${currency}`
  }

  let numValue: number

  if (typeof value === "string") {
    // Remove non-numeric characters except decimal point
    const sanitized = value.replace(/[^\d.-]/g, "")
    numValue = Number.parseFloat(sanitized)

    if (isNaN(numValue)) {
      return `0 ${currency}`
    }
  } else {
    numValue = value
  }

  // Limit to specified decimal places
  return `${numValue.toFixed(decimals)} ${currency}`
}

// Format date safely
export function formatDate(date: Date | string | number | undefined): string {
  if (!date) {
    return ""
  }

  try {
    const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return ""
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

// Safely parse JSON with error handling
export function safeJsonParse(json: string, fallback = {}): any {
  if (!json) return fallback

  try {
    return JSON.parse(json)
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return fallback
  }
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return html.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

// Validate email format
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate a random ID safely
export function generateId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`
}

// Debounce function to limit function calls
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function to limit function calls
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
