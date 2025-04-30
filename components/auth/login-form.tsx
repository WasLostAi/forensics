"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, signInWithWallet, signInAsJudge } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error, success } = await signIn(email, password)

    if (!success) {
      setError(error?.message || "Failed to sign in")
    }

    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error, success } = await signUp(signUpEmail, signUpPassword)

    if (!success) {
      setError(error?.message || "Failed to sign up")
    } else {
      setError("Check your email for a confirmation link.")
    }

    setIsLoading(false)
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if Phantom wallet is available
      const { solana } = window as any

      if (!solana?.isPhantom) {
        setError("Phantom wallet not found. Please install Phantom wallet extension.")
        setIsLoading(false)
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

    setIsLoading(false)
  }

  const handleJudgeAccess = async () => {
    setIsLoading(true)
    setError(null)

    const { error, success } = await signInAsJudge()

    if (!success) {
      setError(error?.message || "Failed to access as judge")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Solana Forensic Toolkit</CardTitle>
        <CardDescription className="text-center">Access the advanced blockchain analysis platform</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant={error.includes("Check your email") ? "default" : "destructive"} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signUpEmail">Email</Label>
                <Input
                  id="signUpEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signUpPassword">Password</Label>
                <Input
                  id="signUpPassword"
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" type="button" className="w-full" onClick={connectWallet} disabled={isLoading}>
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h12" />
          </svg>
          Connect Solana Wallet
        </Button>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="w-full text-xs text-muted-foreground" onClick={handleJudgeAccess}>
          [REDACTED JUDGE]
        </Button>
      </CardFooter>
    </Card>
  )
}
