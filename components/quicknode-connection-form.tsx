"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { isConnected } from "@/lib/solana"

export function QuicknodeConnectionForm() {
  const [rpcUrl, setRpcUrl] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"unchecked" | "checking" | "connected" | "failed">(
    "unchecked",
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load saved RPC URL on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("QUICKNODE_RPC_URL") || process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || ""
    setRpcUrl(savedUrl)

    // Check connection status if we have a saved URL
    if (savedUrl) {
      checkConnection(savedUrl)
    }
  }, [])

  const checkConnection = async (url: string) => {
    try {
      setConnectionStatus("checking")
      setErrorMessage(null)

      const connected = await isConnected(url)

      if (connected) {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("failed")
        setErrorMessage("Could not connect to the Solana network using this RPC URL")
      }
    } catch (error: any) {
      setConnectionStatus("failed")
      setErrorMessage(error.message || "Connection failed")
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Save to localStorage
      localStorage.setItem("QUICKNODE_RPC_URL", rpcUrl)

      // Check connection
      await checkConnection(rpcUrl)
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to save RPC URL")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {connectionStatus === "connected" && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Successfully connected to Solana network</AlertDescription>
        </Alert>
      )}

      {connectionStatus === "failed" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage || "Failed to connect to Solana network"}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="rpc-url">QuickNode RPC URL</Label>
        <Input
          id="rpc-url"
          placeholder="https://your-quicknode-endpoint.quiknode.pro/..."
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">Enter your QuickNode RPC URL to connect to the Solana network</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isSaving || connectionStatus === "checking"}>
          {isSaving || connectionStatus === "checking" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {connectionStatus === "checking" ? "Checking Connection..." : "Saving..."}
            </>
          ) : (
            "Save & Test Connection"
          )}
        </Button>

        {rpcUrl && connectionStatus !== "checking" && (
          <Button variant="outline" onClick={() => checkConnection(rpcUrl)}>
            Test Connection
          </Button>
        )}
      </div>
    </div>
  )
}
