import { EntityClustersView } from "@/components/entity-clusters-view"

export const metadata = {
  title: "Entity Clusters | Solana Forensics",
  description: "Analyze groups of entities with similar behavior patterns",
}

export default function EntityClustersPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entity Clusters</h1>
        <p className="text-muted-foreground">Analyze groups of entities with similar behavior patterns</p>
      </div>

      <EntityClustersView />
    </div>
  )
}
