import { Suspense } from "react"
import { MockModeBanner } from "@/components/mock-mode-banner"
import { SavedInvestigations } from "@/components/saved-investigations"

export default function InvestigationsPage() {
  // Check if we're in mock mode
  const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <main className="container mx-auto px-4 py-8">
      {isMockMode && <MockModeBanner />}
      <Suspense fallback={<div className="mt-8 text-center">Loading investigations...</div>}>
        <SavedInvestigations />
      </Suspense>
    </main>
  )
}
