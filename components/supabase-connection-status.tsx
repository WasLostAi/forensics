"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function SupabaseConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        // Try to make a simple query to test the connection
        const { data, error } = await supabase.from("profiles").select("count").limit(1).single()

        if (error) {
          console.error("Supabase connection error:", error)
          setStatus("error")
          setErrorMessage(error.message)
        } else {
          setStatus("connected")
        }
      } catch (err) {
        console.error("Failed to check Supabase connection:", err)
        setStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      }
    }

    checkConnection()
  }, [])

  if (status === "checking") {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
        <AlertTitle>Checking Supabase Connection</AlertTitle>
        <AlertDescription>Verifying connection to Supabase...</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          Failed to connect to Supabase: {errorMessage || "Unknown error"}. Please check your credentials in the
          settings.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertTitle>Connected to Supabase</AlertTitle>
      <AlertDescription>Your application is successfully connected to Supabase.</AlertDescription>
    </Alert>
  )
}
