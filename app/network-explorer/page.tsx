import { EntityNetworkDashboard } from "@/components/entity-network-dashboard"

export default function NetworkExplorerPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Entity Network Explorer</h1>
      <EntityNetworkDashboard />
    </div>
  )
}
