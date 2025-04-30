import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "An unexpected error occurred"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
