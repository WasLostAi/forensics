"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/contexts/settings-context"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiCredentialsForm() {
  const { apiStatus, apiError, checkApiCredentials, isCheckingApi } = useSettings()
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveSuccess(false)

      // Save to localStorage for now
      localStorage.setItem("ARKHAM_API_KEY", apiKey)
      localStorage.setItem("ARKHAM_API_SECRET", apiSecret)

      // Check if the credentials are valid
      await checkApiCredentials()

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving API credentials:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {apiStatus === "invalid" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError || "Invalid API credentials"}</AlertDescription>
        </Alert>
      )}

      {apiStatus === "network-error" && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError || "Network connection error"}</AlertDescription>
        </Alert>
      )}

      {apiStatus === "valid" && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>API credentials are valid</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>API credentials saved successfully</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="api-key">Arkham API Key</Label>
        <Input
          id="api-key"
          placeholder="Enter your Arkham API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-secret">Arkham API Secret</Label>
        <Input
          id="api-secret"
          type="password"
          placeholder="Enter your Arkham API secret"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={isSaving || isCheckingApi}>
        {isSaving || isCheckingApi ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isCheckingApi ? "Checking..." : "Saving..."}
          </>
        ) : (
          "Save Credentials"
        )}
      </Button>
    </div>
  )
}
