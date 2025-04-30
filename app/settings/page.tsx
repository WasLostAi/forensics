import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiCredentialsForm } from "@/components/api-credentials-form"
import { SupabaseConnectionStatus } from "@/components/supabase-connection-status"
import { QuicknodeConnectionForm } from "@/components/quicknode-connection-form"
import { Separator } from "@/components/ui/separator"

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
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>Status of your Supabase database connection</CardDescription>
          </CardHeader>
          <CardContent>
            <SupabaseConnectionStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Credentials</CardTitle>
            <CardDescription>Configure your API credentials for blockchain data access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">API Credentials</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your Arkham Intelligence API credentials for enhanced entity data
                </p>
              </div>
              <Separator />
              <ApiCredentialsForm />
            </div>

            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-medium">QuickNode Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your QuickNode RPC URL to connect to the Solana network
                </p>
              </div>
              <Separator />
              <QuicknodeConnectionForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
