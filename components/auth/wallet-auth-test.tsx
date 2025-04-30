"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, AlertCircle, Info, Wallet } from "lucide-react"

export function WalletAuthTest() {
  const { user, session, walletAddress, userRole, isAdmin, signInWithWallet, signOut } = useAuth()
  const [phantomInstalled, setPhantomInstalled] = useState<boolean | null>(null)
  const [walletConnected, setWalletConnected] = useState<boolean | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Add a log entry
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  // Check if Phantom is installed
  useEffect(() => {
    const checkPhantom = () => {
      const { solana } = window as any
      const isPhantomInstalled = solana?.isPhantom
      setPhantomInstalled(!!isPhantomInstalled)
      addLog(`Phantom wallet ${isPhantomInstalled ? "detected" : "not detected"}`)

      // Check if wallet is already connected
      if (isPhantomInstalled && solana.isConnected) {
        setWalletConnected(true)
        setPublicKey(solana.publicKey?.toString() || null)
        addLog(`Wallet already connected: ${solana.publicKey?.toString() || "unknown"}`)
      } else {
        setWalletConnected(false)
      }
    }

    // Check immediately and after a short delay to ensure window.solana is available
    checkPhantom()
    const timer = setTimeout(checkPhantom, 500)

    return () => clearTimeout(timer)
  }, [])

  // Connect to Phantom wallet
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    addLog("Attempting to connect to wallet...")

    try {
      const { solana } = window as any

      if (!solana?.isPhantom) {
        const errorMsg = "Phantom wallet not found. Please install Phantom wallet extension."
        setError(errorMsg)
        addLog(`Error: ${errorMsg}`)
        setIsConnecting(false)
        return
      }

      try {
        // Connect to wallet
        addLog("Requesting wallet connection...")
        const response = await solana.connect()
        const walletAddr = response.publicKey.toString()
        setPublicKey(walletAddr)
        setWalletConnected(true)
        addLog(`Connected to wallet: ${walletAddr}`)

        // Sign in with the wallet address
        addLog("Signing in with wallet address...")
        const { error, success } = await signInWithWallet(walletAddr)

        if (success) {
          addLog("Successfully signed in with wallet")
        } else {
          const errorMsg = error?.message || "Failed to sign in with wallet"
          setError(errorMsg)
          addLog(`Error: ${errorMsg}`)
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to connect to wallet"
        console.error("Wallet connection error:", err)
        setError(errorMsg)
        addLog(`Error: ${errorMsg}`)
      }
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred"
      console.error("Wallet connection error:", err)
      setError(errorMsg)
      addLog(`Error: ${errorMsg}`)
    }

    setIsConnecting(false)
  }

  // Sign in as admin for testing
  const signInAsAdmin = async () => {
    setIsConnecting(true)
    setError(null)
    addLog("Signing in as admin for testing...")

    try {
      const adminWallet = "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"
      const { error, success } = await signInWithWallet(adminWallet)

      if (success) {
        addLog(`Successfully signed in as admin with wallet: ${adminWallet}`)
      } else {
        const errorMsg = error?.message || "Failed to sign in as admin"
        setError(errorMsg)
        addLog(`Error: ${errorMsg}`)
      }
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred"
      console.error("Admin sign in error:", err)
      setError(errorMsg)
      addLog(`Error: ${errorMsg}`)
    }

    setIsConnecting(false)
  }

  // Handle sign out
  const handleSignOut = async () => {
    addLog("Signing out...")
    await signOut()
    addLog("Signed out successfully")
    setPublicKey(null)
    setWalletConnected(false)
  }

  return (
    <div className="space-y-6">
      {/* Wallet Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
          <CardDescription>Current status of wallet connection and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Phantom Installed:</span>
              {phantomInstalled === null ? (
                <Badge variant="outline">Checking...</Badge>
              ) : phantomInstalled ? (
                <Badge variant="success" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Yes
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" /> No
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Wallet Connected:</span>
              {walletConnected === null ? (
                <Badge variant="outline">Checking...</Badge>
              ) : walletConnected ? (
                <Badge variant="success" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Yes
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" /> No
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Authenticated:</span>
              {user ? (
                <Badge variant="success" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Yes
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" /> No
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">User Role:</span>
              {userRole === "admin" ? <Badge className="bg-purple-500">Admin</Badge> : <Badge>User</Badge>}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Wallet Address:</h3>
            <code className="block p-2 bg-muted rounded text-xs overflow-auto">
              {publicKey || walletAddress || "Not connected"}
            </code>
          </div>

          {user && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">User ID:</h3>
                <code className="block p-2 bg-muted rounded text-xs overflow-auto">{user.id}</code>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          {!user ? (
            <>
              <Button onClick={connectWallet} disabled={isConnecting || !phantomInstalled} className="w-full">
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
              <Button onClick={signInAsAdmin} variant="outline" disabled={isConnecting} className="w-full">
                Sign In as Admin (Test)
              </Button>
            </>
          ) : (
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Authentication Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Authentication Details
          </CardTitle>
          <CardDescription>Current authentication state information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Session Status:</h3>
            <pre className="block p-2 bg-muted rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(
                {
                  authenticated: !!user,
                  walletConnected: !!walletConnected,
                  walletAddress: walletAddress || null,
                  userRole,
                  isAdmin: isAdmin(),
                  hasSession: !!session,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Connection Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Logs</CardTitle>
          <CardDescription>Step-by-step log of the connection process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded p-2 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No logs yet</p>
            ) : (
              <ul className="space-y-1 text-xs font-mono">
                {logs.map((log, index) => (
                  <li key={index} className="border-b border-border/30 pb-1 last:border-0 last:pb-0">
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
          <CardDescription>Follow these steps to test the wallet authentication flow</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Make sure you have the{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Phantom wallet extension
              </a>{" "}
              installed
            </li>
            <li>Click the "Connect Wallet" button above</li>
            <li>Approve the connection request in the Phantom wallet popup</li>
            <li>The page will update to show your connected wallet address</li>
            <li>You will be authenticated with your wallet address</li>
            <li>
              If your wallet address is{" "}
              <code className="text-xs bg-muted p-1 rounded">AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F</code>, you
              will have admin privileges
            </li>
            <li>For testing purposes, you can also click "Sign In as Admin" to simulate admin authentication</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
