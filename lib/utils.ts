import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSol(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "Unknown date"

  try {
    return new Date(timestamp * 1000).toLocaleDateString()
  } catch (e) {
    console.error("Error formatting date:", e)
    return "Invalid date"
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "Unknown address"

  if (address.length <= chars * 2) return address

  try {
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
  } catch (e) {
    console.error("Error shortening address:", e)
    return address
  }
}
