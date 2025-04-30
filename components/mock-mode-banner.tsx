"use client"

import { useSettings } from "@/contexts/settings-context"
import { Database, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MockModeBanner() {
  const { useMockData, apiStatus } = useSettings()

  if (!useMockData && apiStatus !== "network-error") {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      {apiStatus === "network-error" ? (
        <>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Network Error:</strong> Unable to connect to the Arkham API. Using mock data instead.
          </AlertDescription>
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Mock Mode:</strong> Using simulated data for demonstration purposes.
          </AlertDescription>
        </>
      )}
    </Alert>
  )
}
