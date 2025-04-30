"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { validateArkhamCredentials } from "@/lib/arkham-api"

type SettingsContextType = {
  apiStatus: "unchecked" | "checking" | "valid" | "invalid" | "network-error"
  apiError: string | null
  checkApiCredentials: () => Promise<void>
  isCheckingApi: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiStatus, setApiStatus] = useState<"unchecked" | "checking" | "valid" | "invalid" | "network-error">(
    "unchecked",
  )
  const [apiError, setApiError] = useState<string | null>(null)
  const [isCheckingApi, setIsCheckingApi] = useState(false)

  // Function to check API credentials
  const checkApiCredentials = useCallback(async () => {
    try {
      setIsCheckingApi(true)
      setApiStatus("checking")
      setApiError(null)

      // Check if API keys are configured in environment variables
      const response = await fetch("/api/arkham/validate")
      const data = await response.json()

      if (data.valid) {
        setApiStatus("valid")
      } else {
        setApiStatus("invalid")
        setApiError(data.error || "Invalid API credentials")
      }
    } catch (error) {
      console.error("Error checking API credentials:", error)
      setApiStatus("network-error")
      setApiError("Network error. Please try again.")
    } finally {
      setIsCheckingApi(false)
    }
  }, [])

  // Check API credentials on mount, but with a delay to not block initial render
  // and wrapped in a try-catch to prevent app crashes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        checkApiCredentials().catch((err) => {
          console.error("Failed to check API credentials:", err)
          setApiStatus("network-error")
          setApiError("Failed to check API credentials")
          setIsCheckingApi(false)
        })
      } catch (error) {
        console.error("Error in API credential check:", error)
        setApiStatus("network-error")
        setApiError("Error in API credential check")
        setIsCheckingApi(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [checkApiCredentials])

  return (
    <SettingsContext.Provider
      value={{
        apiStatus,
        apiError,
        checkApiCredentials,
        isCheckingApi,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
