"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const [rpcUrl, setRpcUrl] = useState<string>("")

  useEffect(() => {
    // Simulate connection status check
    const checkConnection = async () => {
      try {
        // In a real app, this would check the actual RPC connection
        const rpcEndpoint = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "https://api.mainnet-beta.solana.com"
        setRpcUrl(rpcEndpoint)

        // Simulate a successful connection after a short delay
        setTimeout(() => {
          setStatus("connected")
        }, 1000)
      } catch (error) {
        setStatus("disconnected")
      }
    }

    checkConnection()
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center mr-2">
            <Badge
              variant={status === "connected" ? "default" : status === "connecting" ? "secondary" : "destructive"}
              className="h-2 w-2 rounded-full"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status === "connected"
              ? `Connected to ${rpcUrl}`
              : status === "connecting"
                ? "Connecting to Solana network..."
                : "Disconnected from Solana network"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
