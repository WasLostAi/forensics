"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithWallet } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get("redirect") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!walletAddress) {
      setError("Please enter a wallet address")
      setIsLoading(false)
      return
    }

    try {
      const { error, success } = await signInWithWallet(walletAddress)
      
      if (error) {
        setError(error.message)
        return
      }
      
      if (success) {
        router.push(redirect)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes, we'll use a simple form to enter a wallet address
  // In a real app, you would integrate with a wallet adapter like Phantom
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Solana Wallet Address</Label>
          <Input
            id="wallet-address"
            placeholder="Enter your Solana wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            For demo purposes only. In a production app, you would connect with a wallet adapter.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      </form>
      
      <div className="space-y-4 mt-6">
        <p className="text-sm text-center text-muted-foreground">Demo wallet addresses:</p>
        <div className="grid gap-2">
          <Button 
            variant="outline" 
            onClick={() => setWalletAddress("AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F")}
            className="text-xs"
          >
            Admin Wallet
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setWalletAddress("5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnZgX37D")}
            className="text-xs"
          >
            User Wallet
          </Button>
        </div>
      </div>
    </div>
  )
}
