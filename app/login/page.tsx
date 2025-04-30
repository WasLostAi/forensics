"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SolanaLogo } from "@/components/solana-logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Wallet } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simple login function that sets a token in localStorage
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    // Simulate login - in a real app, this would call your auth API
    setTimeout(() => {
      localStorage.setItem("auth_token", "user_token_" + Date.now())
      localStorage.setItem("user_email", email)
      router.push("/")
      setLoading(false)
    }, 500)
  }

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
        if (walletAddress === "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F") {
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

  // Judge login function
  const handleJudgeLogin = () => {
    setLoading(true)
    localStorage.setItem("auth_token", "judge_token_" + Date.now())
    localStorage.setItem("user_role", "judge")

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
          <CardTitle className="text-2xl">Sign in to your account</CardTitle>
          <CardDescription>Choose your preferred login method</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="wallet">Solana Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="wallet">
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4 text-center">
                  <Wallet className="mx-auto h-8 w-8 mb-2 text-primary" />
                  <p className="text-sm">Connect your Solana wallet to access the platform</p>
                </div>
                <Button onClick={handleWalletLogin} className="w-full" disabled={loading} variant="outline">
                  {loading ? "Connecting..." : "Connect Phantom Wallet"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <span>For demo purposes: </span>
                  <button
                    onClick={() => {
                      localStorage.setItem("auth_token", "admin_token_" + Date.now())
                      localStorage.setItem("wallet_address", "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F")
                      localStorage.setItem("user_role", "admin")
                      router.push("/")
                    }}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    Sign in as Admin
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-muted-foreground w-full">
            <button onClick={handleJudgeLogin} className="text-primary hover:underline" disabled={loading}>
              [REDACTED JUDGE]
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
