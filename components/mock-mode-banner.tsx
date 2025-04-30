"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { isConnected } from "@/lib/solana"
import { useSettings } from "@/contexts/settings-context"

export function MockModeBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { apiStatus } = useSettings()

  useEffect(() => {
    const checkConnections = async () => {
      try {
        setIsLoading(true)

        // Check Solana connection
        const solanaConnected = await isConnected()

        // Show banner if either connection is not valid
        const shouldShowBanner = !solanaConnected || apiStatus !== "valid"
        setShowBanner(shouldShowBanner)
      } catch (error) {
        console.error("Error checking connections:", error)
        setShowBanner(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnections()
  }, [apiStatus])

  if (isLoading || !showBanner) {
    return null
  }

  return (
    <div className="bg-yellow-900/20 border-yellow-900/30 border text-yellow-500 px-4 py-2 flex items-center text-sm">
      <AlertCircle className="h-4 w-4 mr-2" />
      <span>Mock Mode Active</span>
      <span className="ml-1">
        You are currently viewing mock data. To see real data, please configure your{" "}
        {apiStatus !== "valid" ? "Arkham API credentials" : ""}
        {apiStatus !== "valid" && !isConnected ? " and " : ""}
        {!isConnected ? "QuickNode RPC URL" : ""} in the settings.
      </span>
    </div>
  )
}
