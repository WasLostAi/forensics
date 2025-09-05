"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Wallet } from "lucide-react"
import { SolanaLogo } from "@/components/solana-logo"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wallet login function
  const handleWalletLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if Phantom wallet is available
      const { solana } = window as any

      if (!solana?.isPhantom) {
        setError("Phantom wallet not found. Please install Phantom wallet extension.")
        setLoading(false)
        return
      }

      try {
        // Connect to wallet
        const response = await solana.connect()
        const walletAddress = response.publicKey.toString()

        // Store wallet address in localStorage
        localStorage.setItem("auth_token", "wallet_token_" + Date.now())
        localStorage.setItem("wallet_address", walletAddress)

        // Check if admin wallet
        const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
        if (adminWalletAddress && walletAddress === adminWalletAddress) {
          localStorage.setItem("user_role", "admin")
        } else {
          localStorage.setItem("user_role", "user")
        }

        router.push("/")
      } catch (err) {
        console.error("Wallet connection error:", err)
        setError("Failed to connect to wallet. Please try again.")
      }
    } catch (err) {
      console.error("Wallet connection error:", err)
      setError("An unexpected error occurred. Please try again.")
    }

    setLoading(false)
  }

  // Demo login function for testing
  const handleDemoLogin = () => {
    setLoading(true)
    localStorage.setItem("auth_token", "demo_token_" + Date.now())
    localStorage.setItem("wallet_address", "Demo12345WalletAddressForTesting")
    localStorage.setItem("user_role", "user")

    setTimeout(() => {
      router.push("/")
      setLoading(false)
    }, 300)
  }

  // Admin login function for testing
  const handleAdminLogin = () => {
    setLoading(true)
    const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"
    localStorage.setItem("auth_token", "admin_token_" + Date.now())
    localStorage.setItem("wallet_address", adminWalletAddress)
    localStorage.setItem("user_role", "admin")

    setTimeout(() => {
      router.push("/")
      setLoading(false)
    }, 300)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <SolanaLogo height={40} subtitle="Forensics" />
          </div>
          <CardTitle className="text-2xl">Solana Wallet Forensics</CardTitle>
          <CardDescription>Connect your wallet to access the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-center">
              <Wallet className="mx-auto h-8 w-8 mb-2 text-primary" />
              <p className="text-sm">Connect your Solana wallet to access the platform</p>
            </div>
            <Button onClick={handleWalletLogin} className="w-full" disabled={loading}>
              {loading ? "Connecting..." : "Connect Phantom Wallet"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p className="mb-2">For demo purposes:</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleDemoLogin} disabled={loading} size="sm">
                  Demo User Login
                </Button>
                <Button variant="outline" onClick={handleAdminLogin} disabled={loading} size="sm">
                  Admin Login
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
