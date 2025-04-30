"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithWallet } = useAuth()

  // Function to handle wallet connection
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if Phantom wallet is available
      const { solana } = window as any

      if (!solana?.isPhantom) {
        setError("Phantom wallet not found. Please install Phantom wallet extension.")
        setIsConnecting(false)
        return
      }

      try {
        // Connect to wallet
        const response = await solana.connect()
        const walletAddress = response.publicKey.toString()

        // Sign in with the wallet address
        const { error, success } = await signInWithWallet(walletAddress)

        if (!success) {
          setError(error?.message || "Failed to sign in with wallet")
        }
      } catch (err) {
        console.error("Wallet connection error:", err)
        setError("Failed to connect to wallet. Please try again.")
      }
    } catch (err) {
      console.error("Wallet connection error:", err)
      setError("An unexpected error occurred. Please try again.")
    }

    setIsConnecting(false)
  }

  // For demo purposes, allow direct sign-in with admin wallet
  const signInAsAdmin = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const { error, success } = await signInWithWallet("AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F")

      if (!success) {
        setError(error?.message || "Failed to sign in as admin")
      }
    } catch (err) {
      console.error("Admin sign in error:", err)
      setError("An unexpected error occurred. Please try again.")
    }

    setIsConnecting(false)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={connectWallet} className="w-full" disabled={isConnecting} variant="outline">
        {isConnecting ? "Connecting..." : "Connect Phantom Wallet"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <span>For demo purposes: </span>
        <button onClick={signInAsAdmin} className="text-primary hover:underline" disabled={isConnecting}>
          Sign in as Admin
        </button>
      </div>
    </div>
  )
}
