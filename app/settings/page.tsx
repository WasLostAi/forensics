import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiCredentialsForm } from "@/components/api-credentials-form"

export const metadata: Metadata = {
  title: "Settings | Solana Forensic Toolkit",
  description: "Configure your Solana Forensic Toolkit settings",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Credentials</CardTitle>
            <CardDescription>Configure your API credentials for blockchain data access</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiCredentialsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
