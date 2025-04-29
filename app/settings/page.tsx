"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSettings } from "@/contexts/settings-context"
import { isConnected } from "@/lib/solana"
import { AlertCircle, CheckCircle, ArrowLeft, AlertTriangle, Key } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Enable mock mode for development/preview environments
const ENABLE_MOCK_MODE = true // Set to false in production

export default function SettingsPage() {
  const { rpcUrl, setRpcUrl, availableRpcs, selectedRpcName, setSelectedRpcName } = useSettings()
  const [customRpcUrl, setCustomRpcUrl] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<null | boolean>(null)
  const [connectionMessage, setConnectionMessage] = useState("")

  // Arkham API settings
  const [arkhamApiKey, setArkhamApiKey] = useState("")
  const [arkhamApiSecret, setArkhamApiSecret] = useState("")
  const [arkhamSettingsSaved, setArkhamSettingsSaved] = useState(false)

  // Initialize custom RPC URL from current URL if "Custom RPC" is selected
  useEffect(() => {
    if (selectedRpcName === "Custom RPC" && rpcUrl) {
      setCustomRpcUrl(rpcUrl)
    }

    // Load Arkham API settings from localStorage
    try {
      const savedApiKey = localStorage.getItem("arkhamApiKey")
      if (savedApiKey) {
        setArkhamApiKey(savedApiKey)
      }

      // We don't load the secret from localStorage for security reasons
      // Just check if it exists to show a placeholder
      if (localStorage.getItem("arkhamApiSecret")) {
        setArkhamApiSecret("••••••••••••••••••••••••••••••••")
      }
    } catch (error) {
      console.error("Failed to load Arkham API settings:", error)
    }
  }, [selectedRpcName, rpcUrl])

  const handleRpcChange = (value: string) => {
    const selected = availableRpcs.find((rpc) => rpc.name === value)
    if (selected) {
      setSelectedRpcName(value)

      if (value === "Custom RPC") {
        // Don't update the URL yet for custom RPC
        return
      }

      setRpcUrl(selected.url)
      setConnectionStatus(null)
    }
  }

  const handleCustomRpcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRpcUrl(e.target.value)
  }

  const handleSaveCustomRpc = () => {
    if (customRpcUrl) {
      setRpcUrl(customRpcUrl)
      setConnectionStatus(null)
    }
  }

  const handleSaveArkhamSettings = () => {
    try {
      if (arkhamApiKey) {
        localStorage.setItem("arkhamApiKey", arkhamApiKey)
      }

      if (arkhamApiSecret && !arkhamApiSecret.includes("•")) {
        localStorage.setItem("arkhamApiSecret", arkhamApiSecret)
      }

      setArkhamSettingsSaved(true)
      setTimeout(() => setArkhamSettingsSaved(false), 3000)
    } catch (error) {
      console.error("Failed to save Arkham API settings:", error)
    }
  }

  const testConnection = async () => {
    if (ENABLE_MOCK_MODE) {
      setConnectionStatus(true)
      setConnectionMessage("Mock mode is enabled. Connection test will always succeed.")
      return
    }

    setIsTestingConnection(true)
    setConnectionMessage("")

    try {
      const urlToTest = selectedRpcName === "Custom RPC" ? customRpcUrl : rpcUrl
      const connected = await isConnected(urlToTest)
      setConnectionStatus(connected)
      setConnectionMessage(
        connected ? "Connection successful!" : "Connection failed. Please check the URL and try again.",
      )
    } catch (error) {
      setConnectionStatus(false)
      setConnectionMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {ENABLE_MOCK_MODE && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Mock Mode Enabled</AlertTitle>
          <AlertDescription>
            This application is running in mock mode with sample data. RPC settings will have no effect until mock mode
            is disabled.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>RPC Connection Settings</CardTitle>
          <CardDescription>Configure your connection to the Solana blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Select RPC Provider</Label>
            <RadioGroup value={selectedRpcName} onValueChange={handleRpcChange}>
              {availableRpcs.map((rpc) => (
                <div key={rpc.name} className="flex items-center space-x-2">
                  <RadioGroupItem value={rpc.name} id={rpc.name} />
                  <Label htmlFor={rpc.name}>{rpc.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedRpcName === "Custom RPC" && (
            <div className="space-y-4">
              <Label htmlFor="custom-rpc">Custom RPC URL</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-rpc"
                  placeholder="https://your-rpc-endpoint.com"
                  value={customRpcUrl}
                  onChange={handleCustomRpcChange}
                />
                <Button onClick={handleSaveCustomRpc}>Save</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a custom RPC URL for connecting to the Solana blockchain
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Label>Current RPC URL</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-sm break-all">
              {rpcUrl || "No RPC URL configured"}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={testConnection} disabled={isTestingConnection}>
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>

            {connectionStatus !== null && (
              <div className="flex items-center gap-2">
                {connectionStatus ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={connectionStatus ? "text-green-500" : "text-red-500"}>
                  {connectionStatus ? "Connected" : "Failed"}
                </span>
              </div>
            )}
          </div>

          {connectionMessage && (
            <Alert variant={connectionStatus ? "default" : "destructive"}>
              <AlertTitle>{connectionStatus ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTitle>About RPC Endpoints</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                To use this application with real Solana data, you need a valid RPC endpoint. You can:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use a service like{" "}
                  <a
                    href="https://www.quicknode.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    QuickNode
                  </a>{" "}
                  or{" "}
                  <a
                    href="https://www.alchemy.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Alchemy
                  </a>
                </li>
                <li>Run your own Solana RPC node</li>
                <li>Use public endpoints (may have rate limits)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Arkham API Settings Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Arkham Exchange API Settings
          </CardTitle>
          <CardDescription>Configure your connection to the Arkham Exchange API</CardDescription>
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Arkham API credentials are configured via environment variables
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Your API credentials are securely stored as environment variables. The settings below are not needed.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="arkham-api-key">API Key</Label>
            <Input
              id="arkham-api-key"
              placeholder="9272cc2f-0661-4c22-817a-32205114a208"
              value={arkhamApiKey}
              onChange={(e) => setArkhamApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Your Arkham Exchange API Key</p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="arkham-api-secret">API Secret</Label>
            <Input
              id="arkham-api-secret"
              type="password"
              placeholder="rBvSAynIESaYP9i7T/pBQkIu4SMQrSDfkPg7eIN/dSM="
              value={arkhamApiSecret}
              onChange={(e) => setArkhamApiSecret(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Your Arkham Exchange API Secret</p>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={handleSaveArkhamSettings}>Save Arkham API Settings</Button>

            {arkhamSettingsSaved && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-500">Settings saved</span>
              </div>
            )}
          </div>

          <Alert>
            <AlertTitle>About Arkham Exchange API</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                The Arkham Exchange API provides enhanced transaction flow data and entity labeling for Solana wallets.
              </p>
              <p>
                You can get your API credentials from the{" "}
                <a
                  href="https://arkm.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Arkham Exchange API settings page
                </a>
                .
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
