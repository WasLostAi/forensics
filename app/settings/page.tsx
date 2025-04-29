"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export default function SettingsPage() {
  const { useMockData, setUseMockData, apiCredentialsValid, apiErrorMessage, checkApiCredentials, isLoading } =
    useSettings()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure the Arkham API settings for wallet analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Use Mock Data</h3>
                <p className="text-sm text-muted-foreground">Use mock data instead of making real API calls</p>
              </div>
              <Switch checked={useMockData} onCheckedChange={setUseMockData} />
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">API Status</h3>
                <Button variant="outline" size="sm" onClick={() => checkApiCredentials()} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Check
                </Button>
              </div>

              {apiCredentialsValid === true && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">API Connected</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Arkham API credentials are valid and working correctly.
                  </AlertDescription>
                </Alert>
              )}

              {apiCredentialsValid === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>API Connection Failed</AlertTitle>
                  <AlertDescription>
                    {apiErrorMessage || "Could not connect to the Arkham API. Using mock data instead."}
                  </AlertDescription>
                </Alert>
              )}

              {apiCredentialsValid === null && !isLoading && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>API Status Unknown</AlertTitle>
                  <AlertDescription>Click "Check" to verify API connection status.</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Checking API connection...
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {useMockData ? "Using mock data for all API requests" : "Using real API data when available"}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
