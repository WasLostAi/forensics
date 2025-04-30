"use client"

import { useSettings } from "@/contexts/settings-context"
import { WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MockModeBanner() {
  const { apiStatus } = useSettings()

  if (apiStatus !== "network-error") {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <strong>Network Error:</strong> Unable to connect to the Arkham API. Please check your connection and try again.
      </AlertDescription>
    </Alert>
  )
}
