import { SavedInvestigations } from "@/components/saved-investigations"

export default function InvestigationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Investigations</h1>
      <SavedInvestigations />
    </div>
  )
}
