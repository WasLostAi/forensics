"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function ConnectionStatusChecker() {
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking")
  const [quicknodeStatus, setQuicknodeStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function checkSupabaseConnection() {
      try {
        // Check if we can access Supabase
        const { error } = await supabase.from("profiles").select("count").limit(1).single()

        if (error && error.message !== "Mock mode active") {
          console.error("Supabase connection error:", error)
          setSupabaseStatus("error")
          setErrorMessage(error.message)
        } else {
          setSupabaseStatus("connected")
        }
      } catch (err) {
        console.error("Failed to check Supabase connection:", err)
        setSupabaseStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      }
    }

    async function checkQuicknodeConnection() {
      try {
        // Check if we can access QuickNode
        const response = await fetch("/api/check-rpc", {
          method: "POST",
        })

        const data = await response.json()

        if (data.success) {
          setQuicknodeStatus("connected")
        } else {
          setQuicknodeStatus("error")
          setErrorMessage(data.error || "Failed to connect to QuickNode")
        }
      } catch (err) {
        console.error("Failed to check QuickNode connection:", err)
        setQuicknodeStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      }
    }

    checkSupabaseConnection()
    checkQuicknodeConnection()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Supabase Status:</h3>
        {supabaseStatus === "checking" ? (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            <AlertTitle>Checking Supabase Connection</AlertTitle>
          </Alert>
        ) : supabaseStatus === "error" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase Connection Error</AlertTitle>
            <AlertDescription>{errorMessage || "Unknown error"}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Connected to Supabase</AlertTitle>
          </Alert>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">QuickNode Status:</h3>
        {quicknodeStatus === "checking" ? (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            <AlertTitle>Checking QuickNode Connection</AlertTitle>
          </Alert>
        ) : quicknodeStatus === "error" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>QuickNode Connection Error</AlertTitle>
            <AlertDescription>{errorMessage || "Unknown error"}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Connected to QuickNode</AlertTitle>
          </Alert>
        )}
      </div>
    </div>
  )
}
