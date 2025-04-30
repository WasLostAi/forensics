"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { validateArkhamCredentials } from "@/lib/arkham-api"

type SettingsContextType = {
  useMockData: boolean
  setUseMockData: (value: boolean) => void
  apiStatus: "unchecked" | "checking" | "valid" | "invalid" | "network-error"
  apiError: string | null
  checkApiCredentials: () => Promise<void>
  isCheckingApi: boolean
  rpcUrl: string
  setRpcUrl: (url: string) => void
  selectedRpcName: string
  setSelectedRpcName: (name: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [useMockData, setUseMockData] = useState(true) // Default to true for better UX
  const [apiStatus, setApiStatus] = useState<"unchecked" | "checking" | "valid" | "invalid" | "network-error">(
    "unchecked",
  )
  const [apiError, setApiError] = useState<string | null>(null)
  const [isCheckingApi, setIsCheckingApi] = useState(false)
  const [rpcUrl, setRpcUrl] = useState<string>(process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "")
  const [selectedRpcName, setSelectedRpcName] = useState<string>("QuickNode")

  // Function to check API credentials
  const checkApiCredentials = async () => {
    try {
      setIsCheckingApi(true)
      setApiStatus("checking")

      const result = await validateArkhamCredentials()

      if (result.success) {
        setApiStatus("valid")
        setApiError(null)
      } else if (result.networkError) {
        setApiStatus("network-error")
        setApiError(result.error || "Network connection error")
      } else {
        setApiStatus("invalid")
        setApiError(result.error || "Invalid API credentials")
      }
    } catch (error: any) {
      console.error("Error checking API credentials:", error)
      setApiStatus("invalid")
      setApiError(error.message || "Unknown error")
    } finally {
      setIsCheckingApi(false)
    }
  }

  // Check API credentials on mount, but with a delay to not block initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      checkApiCredentials()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("solanaForensicsSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setUseMockData(settings.useMockData ?? true)
        if (settings.rpcUrl) setRpcUrl(settings.rpcUrl)
        if (settings.selectedRpcName) setSelectedRpcName(settings.selectedRpcName)
      } catch (e) {
        console.error("Error parsing saved settings:", e)
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(
      "solanaForensicsSettings",
      JSON.stringify({
        useMockData,
        rpcUrl,
        selectedRpcName,
      }),
    )
  }, [useMockData, rpcUrl, selectedRpcName])

  return (
    <SettingsContext.Provider
      value={{
        useMockData,
        setUseMockData,
        apiStatus,
        apiError,
        checkApiCredentials,
        isCheckingApi,
        rpcUrl,
        setRpcUrl,
        selectedRpcName,
        setSelectedRpcName,
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
