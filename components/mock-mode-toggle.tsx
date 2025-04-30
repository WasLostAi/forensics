"use client"

import { useSettings } from "@/contexts/settings-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MockModeToggle() {
  const { useMockData, setUseMockData, apiStatus } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Source Settings</CardTitle>
        <CardDescription>Configure whether to use real blockchain data or mock data for testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiStatus === "invalid" && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Credentials Invalid</AlertTitle>
            <AlertDescription>
              Your API credentials are invalid or missing. Mock mode will be used until valid credentials are provided.
            </AlertDescription>
          </Alert>
        )}

        {apiStatus === "network-error" && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription>
              Cannot connect to the API. Check your internet connection or try again later.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="mock-mode"
            checked={useMockData}
            onCheckedChange={setUseMockData}
            disabled={apiStatus === "invalid" || apiStatus === "network-error"}
          />
          <Label htmlFor="mock-mode">Use Mock Data</Label>
        </div>

        <div className="text-sm text-muted-foreground">
          {useMockData ? (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <span>
                Using mock data for demonstration purposes. This data does not represent real blockchain transactions.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <span>
                Using real blockchain data. API requests will be made to fetch transaction data from the Solana
                blockchain.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
