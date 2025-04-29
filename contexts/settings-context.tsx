"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { validateArkhamCredentials } from "@/lib/arkham-api"

interface SettingsContextType {
  useMockData: boolean
  setUseMockData: (value: boolean) => void
  apiCredentialsValid: boolean | null
  apiErrorMessage: string | null
  checkApiCredentials: () => Promise<void>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [useMockData, setUseMockData] = useState(true) // Default to true to avoid API errors
  const [apiCredentialsValid, setApiCredentialsValid] = useState<boolean | null>(null)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("walletForensicsSettings")
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setUseMockData(parsedSettings.useMockData ?? true)
      } catch (e) {
        console.error("Failed to parse saved settings:", e)
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("walletForensicsSettings", JSON.stringify({ useMockData }))
  }, [useMockData])

  // Check API credentials on mount, but don't block rendering
  useEffect(() => {
    // Use a delayed check to avoid blocking initial render
    const timer = setTimeout(() => {
      checkApiCredentials()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const checkApiCredentials = async () => {
    if (isLoading) return

    setIsLoading(true)
    setApiErrorMessage(null)

    try {
      const result = await validateArkhamCredentials()
      setApiCredentialsValid(result.valid)

      if (!result.valid) {
        let errorMsg = "API credentials are invalid or not configured."

        if (result.reason === "network_error") {
          errorMsg = "Cannot connect to Arkham API. Please check your internet connection."
        } else if (result.reason === "timeout") {
          errorMsg = "Connection to Arkham API timed out. Please try again later."
        } else if (result.reason === "fetch_error") {
          errorMsg = `Error connecting to API: ${result.error || "Unknown error"}`
        }

        setApiErrorMessage(errorMsg)

        // If credentials are invalid, default to mock data
        if (!useMockData) {
          setUseMockData(true)
        }
      }
    } catch (error) {
      console.error("Error checking API credentials:", error)
      setApiCredentialsValid(false)
      setApiErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      setUseMockData(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        useMockData,
        setUseMockData,
        apiCredentialsValid,
        apiErrorMessage,
        checkApiCredentials,
        isLoading,
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
