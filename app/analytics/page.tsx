import type { Metadata } from "next"
import { AnalyticsView } from "@/components/analytics-view"

export const metadata: Metadata = {
  title: "Analytics | Solana Forensics",
  description: "Forensic analytics and insights for blockchain transactions",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Forensic insights and data visualization</p>
        </div>
      </div>
      <AnalyticsView />
    </div>
  )
}
