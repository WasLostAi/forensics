import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function MockModeBanner() {
  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Mock Mode Enabled</AlertTitle>
      <AlertDescription>
        This application is running in mock mode with sample data. To use real Solana data, you need to{" "}
        <Link href="/settings" className="underline font-medium">
          configure a valid RPC endpoint
        </Link>
        .
      </AlertDescription>
    </Alert>
  )
}
