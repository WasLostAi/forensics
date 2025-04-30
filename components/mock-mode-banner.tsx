"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSettings } from "@/contexts/settings-context"

export function MockModeBanner() {
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null)
  const [quicknodeConnected, setQuicknodeConnected] = useState<boolean | null>(null)
  const { apiStatus } = useSettings()

  useEffect(() => {
    // Check Supabase connection
    async function checkSupabase() {
      try {
        const response = await fetch("/api/check-supabase", { method: "POST" })
        const data = await response.json()
        setSupabaseConnected(data.success)
      } catch (error) {
        console.error("Error checking Supabase:", error)
        setSupabaseConnected(false)
      }
    }

    // Check QuickNode connection
    async function checkQuicknode() {
      try {
        const response = await fetch("/api/check-rpc", { method: "POST" })
        const data = await response.json()
        setQuicknodeConnected(data.success)
      } catch (error) {
        console.error("Error checking QuickNode:", error)
        setQuicknodeConnected(false)
      }
    }

    checkSupabase()
    checkQuicknode()
  }, [])

  // Don't show anything while checking
  if (supabaseConnected === null || quicknodeConnected === null) {
    return null
  }

  // If all connections are good, don't show the banner
  if (supabaseConnected && quicknodeConnected && apiStatus === "valid") {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Limited Functionality</AlertTitle>
      <AlertDescription>
        {!supabaseConnected && "Supabase connection issue. "}
        {!quicknodeConnected && "QuickNode RPC connection issue. "}
        {apiStatus !== "valid" && "Arkham API credentials issue. "}
        Some features may be unavailable or using mock data.
      </AlertDescription>
    </Alert>
  )
}
