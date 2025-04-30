import { Suspense } from "react"
import { MonitoringDashboard } from "@/components/monitoring-dashboard"

export default function MonitoringPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="mt-8 text-center">Loading monitoring dashboard...</div>}>
        <MonitoringDashboard />
      </Suspense>
    </main>
  )
}
