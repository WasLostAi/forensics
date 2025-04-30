"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, WifiOff, Database } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

interface ApiFallbackProps {
  title?: string
  description?: string
  error?: string
  isNetworkError?: boolean
  onRetry?: () => void
  children?: React.ReactNode
}

export function ApiFallback({
  title = "Connection Error",
  description = "We couldn't connect to the API. Using mock data instead.",
  error,
  isNetworkError = true,
  onRetry,
  children,
}: ApiFallbackProps) {
  const { useMockData, setUseMockData } = useSettings()

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isNetworkError ? (
            <WifiOff className="h-5 w-5 text-amber-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Using mock data for demonstration</span>
        </div>

        {children}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setUseMockData(!useMockData)}>
          {useMockData ? "Try Real Data" : "Use Mock Data"}
        </Button>
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
