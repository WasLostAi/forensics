"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from "lucide-react"
import { MockModeToggle } from "@/components/mock-mode-toggle"

export default function SettingsPage() {
  const { useMockData, setUseMockData, apiStatus, apiError, checkApiCredentials, isCheckingApi } = useSettings()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure the Arkham Intelligence API settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">API Status</h3>
                <p className="text-sm text-gray-500">Status of the connection to the Arkham API</p>
              </div>
              <div className="flex items-center">
                {apiStatus === "checking" ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : apiStatus === "valid" ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Connected</span>
                  </div>
                ) : apiStatus === "network-error" ? (
                  <div className="flex items-center text-amber-500">
                    <WifiOff className="h-4 w-4 mr-2" />
                    <span>Network Error</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Not Connected</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => checkApiCredentials()}
                  disabled={isCheckingApi}
                >
                  <RefreshCw className={`h-4 w-4 ${isCheckingApi ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {apiError && (
              <Alert variant={apiStatus === "network-error" ? "warning" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{apiStatus === "network-error" ? "Network Error" : "API Error"}</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {apiStatus === "network-error" && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Using Mock Data</AlertTitle>
                <AlertDescription>
                  Due to network connectivity issues, the application is using mock data. Real-time data from the Arkham
                  API is not available.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Use Mock Data</h3>
                <p className="text-sm text-gray-500">Use mock data instead of making real API calls</p>
              </div>
              <Switch checked={useMockData} onCheckedChange={setUseMockData} />
            </div>
          </CardContent>
        </Card>
        <MockModeToggle />
      </div>
    </div>
  )
}
