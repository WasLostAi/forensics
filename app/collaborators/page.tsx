import type { Metadata } from "next"
import { CollaboratorsView } from "@/components/collaborators-view"

export const metadata: Metadata = {
  title: "Collaborators | Solana Forensics",
  description: "Manage team members and collaborators for your forensic investigations",
}

export default function CollaboratorsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collaborators</h1>
          <p className="text-muted-foreground">Manage team members and access to your investigations</p>
        </div>
      </div>
      <CollaboratorsView />
    </div>
  )
}
