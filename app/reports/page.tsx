import type { Metadata } from "next"
import { ReportsView } from "@/components/reports-view"

export const metadata: Metadata = {
  title: "Reports | Solana Forensics",
  description: "Generate and view forensic analysis reports",
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and manage forensic analysis reports</p>
        </div>
      </div>
      <ReportsView />
    </div>
  )
}
