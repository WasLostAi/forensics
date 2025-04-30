import { AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { isMockData } from "@/lib/supabase"

export function MockDataBanner() {
  if (!isMockData) return null

  return (
    <Alert variant="warning" className="bg-yellow-50 border-yellow-200 mb-4">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Mock Data Mode</AlertTitle>
      <AlertDescription className="text-yellow-700">
        The application is currently using mock data because the Supabase connection is not available or properly
        configured. Check your environment variables and Supabase setup.
      </AlertDescription>
    </Alert>
  )
}
