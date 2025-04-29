"use client"

import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import Link from "next/link"

export function MockModeBanner() {
  const { useMockData } = useSettings()

  if (!useMockData) return null

  return (
    <Alert className="mb-6 bg-amber-500/10 text-amber-500 border-amber-500/20">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <span className="font-medium">Mock Mode Active:</span> You're viewing simulated data for demonstration purposes.{" "}
        <Link href="/settings" className="underline underline-offset-2">
          Disable in Settings
        </Link>
      </AlertDescription>
    </Alert>
  )
}
