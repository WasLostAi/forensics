import { InvestigationManagement } from "@/components/investigation-management"

// Mock data for investigations
const mockInvestigations = [
  {
    id: "1",
    title: "Suspicious Token Activity Investigation",
    description: "Analyzing unusual transaction patterns in new token launch",
    status: "active" as const,
    priority: "high" as const,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    addresses: ["8ZUczUwNthNFSYxjZ8xzQx5fVZyNYwJLjcQGpTARHyUQ", "5vnatyZRJK1FM7qQ3BHNVLzAQPtpLyRQXqXNLiJvQTvN"],
    tags: ["suspicious", "token dump", "wash trading"],
    transactions: ["2z5PhHW3zVsFtbLYyWEJcTH5YmQjzUmHBo99uGcGGLxEcG9JdPvJmb6nZ2M1N961TrVn2FPoPGHxu1sys7Y3vmDe"],
    collaborators: ["user1", "user2"],
  },
  {
    id: "2",
    title: "Exchange Wallet Tracking",
    description: "Monitoring transactions between known exchange wallets",
    status: "active" as const,
    priority: "medium" as const,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    addresses: ["9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin", "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"],
    tags: ["exchange", "tracking", "monitoring"],
    transactions: [],
    collaborators: ["user3"],
  },
  {
    id: "3",
    title: "NFT Fraud Investigation",
    description: "Analyzing potential fraud in NFT marketplace",
    status: "completed" as const,
    priority: "high" as const,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    addresses: ["BM8sVGbpbiCjUJwNB4WwGybKNJX6Xe2JJFXnS2MZ9bNW"],
    tags: ["NFT", "fraud", "marketplace"],
    transactions: ["663CUybecJ8oSNuAJmVgE9RfMxdWGRgmSXGGZfxprHaFGBvs5LX5bYxp8sQyryxGxhvAMHUvbFcKRbkbGQKdMynV"],
    collaborators: [],
  },
]

// Mock data for collaborators
const mockCollaborators = [
  {
    id: "user1",
    name: "Alice Johnson",
    email: "alice@example.com",
  },
  {
    id: "user2",
    name: "Bob Smith",
    email: "bob@example.com",
  },
  {
    id: "user3",
    name: "Carol Davis",
    email: "carol@example.com",
  },
  {
    id: "user4",
    name: "Dave Wilson",
    email: "dave@example.com",
  },
]

export default function InvestigationsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Investigations</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage investigations to track and analyze suspicious Solana blockchain activity.
      </p>

      <InvestigationManagement initialInvestigations={mockInvestigations} collaborators={mockCollaborators} />
    </div>
  )
}
