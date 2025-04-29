"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { isConnected } from "@/lib/solana"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import Link from "next/link"

// Enable mock mode for development/preview environments
const ENABLE_MOCK_MODE = true // Set to false in production

export function ConnectionStatus() {
  const { rpcUrl, selectedRpcName } = useSettings()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      setChecking(true)
      setErrorMessage(null)

      try {
        console.log("Checking Solana connection status...")
        const status = await isConnected(rpcUrl)
        console.log(`Connection status: ${status ? "Connected" : "Not connected"}`)
        setConnected(status)

        if (!status) {
          setErrorMessage("Connection failed. Try a different RPC endpoint.")
        }
      } catch (error) {
        console.error("Error checking connection:", error)
        setConnected(false)
        setErrorMessage(error instanceof Error ? error.message : "Unknown connection error")
      } finally {
        setChecking(false)
      }
    }

    checkConnection()

    // Check connection status periodically
    const interval = setInterval(checkConnection, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [rpcUrl])

  if (ENABLE_MOCK_MODE) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Mock Mode
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Running in mock mode with sample data</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (checking) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <AlertCircle className="h-3 w-3 mr-1" />
        Checking connection...
      </Badge>
    )
  }

  if (connected === true) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected to {selectedRpcName}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Using {rpcUrl}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/settings" className="hover:no-underline">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Connection Issue
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p>Connection failed. Click to change RPC settings.</p>
            {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
