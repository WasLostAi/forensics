"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MockModeBanner() {
  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Mock Mode Active</AlertTitle>
      <AlertDescription>
        You are currently viewing mock data. To see real data, please configure your Supabase credentials in the
        settings.
      </AlertDescription>
    </Alert>
  )
}
