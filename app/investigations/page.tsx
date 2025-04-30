import { Suspense } from "react"
import { SavedInvestigations } from "@/components/saved-investigations"

export default function InvestigationsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="mt-8 text-center">Loading investigations...</div>}>
        <SavedInvestigations />
      </Suspense>
    </main>
  )
}
