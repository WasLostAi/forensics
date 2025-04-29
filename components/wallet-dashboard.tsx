"use client"
import { useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TransactionFlow } from "@/components/transaction-flow"
import { WalletOverview } from "@/components/wallet-overview"
import { TransactionList } from "@/components/transaction-list"
import { EntityLabels } from "@/components/entity-labels"
import { TransactionClusters } from "@/components/transaction-clusters"
import { FundingSourceAnalysis } from "@/components/funding-source-analysis"
import { AdvancedFilters } from "@/components/advanced-filters"
import { ExportReport } from "@/components/export-report"
import { CollaborationTools } from "@/components/collaboration-tools"
import { OnboardingTour } from "@/components/onboarding-tour"
import { Bookmark, BookmarkPlus } from "lucide-react"

export function WalletDashboard({ walletAddress }: { walletAddress?: string }) {
  const searchParams = useSearchParams()
  const addressParam = searchParams.get("address")
  const finalWalletAddress = walletAddress || addressParam || ""

  const tabParam = searchParams.get("tab")
  const defaultTab = tabParam || "flow"

  // Initialize state variables with default values
  const [filters, setFilters] = useState<any>({})
  const [isSaved, setIsSaved] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  // If no wallet address is provided, show a message
  if (!finalWalletAddress) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Wallet Address Provided</CardTitle>
            <CardDescription>Please enter a Solana wallet address to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Use the search bar to look up a Solana wallet address
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    console.log("Applied filters:", newFilters)
  }

  const handleSaveInvestigation = () => {
    // In a real implementation, this would open the save dialog
    // For now, just toggle the saved state
    setIsSaved(!isSaved)
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      <OnboardingTour />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-genos font-bold solana-gradient-text">Wallet Analysis</h1>
          <p className="text-muted-foreground">
            Analyzing wallet: <span className="font-mono">{finalWalletAddress}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveInvestigation} className="gap-2">
            {isSaved ? (
              <>
                <Bookmark className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <ExportReport walletAddress={finalWalletAddress} reportRef={reportRef} />

          <CollaborationTools walletAddress={finalWalletAddress} />
        </div>
      </div>

      <AdvancedFilters onFilterChange={handleFilterChange} />

      <WalletOverview walletAddress={finalWalletAddress} />

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-5 bg-secondary/40 backdrop-blur-sm">
          <TabsTrigger value="flow" className="font-genos">
            Transaction Flow
          </TabsTrigger>
          <TabsTrigger value="funding" className="font-genos">
            Funding Sources
          </TabsTrigger>
          <TabsTrigger value="transactions" className="font-genos">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="clusters" className="font-genos">
            Transaction Clusters
          </TabsTrigger>
          <TabsTrigger value="entities" className="font-genos">
            Entity Labels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-genos">Transaction Flow Visualization</CardTitle>
              <CardDescription>Interactive visualization of fund movements between wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionFlow walletAddress={finalWalletAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-genos">Funding Source Analysis</CardTitle>
              <CardDescription>Detailed analysis of where funds originated from</CardDescription>
            </CardHeader>
            <CardContent>
              <FundingSourceAnalysis walletAddress={finalWalletAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-genos">Transaction History</CardTitle>
              <CardDescription>Complete history of transactions for this wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList walletAddress={finalWalletAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-genos">Transaction Clusters</CardTitle>
              <CardDescription>Groups of related transactions and associated wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionClusters walletAddress={finalWalletAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-genos">Entity Labels</CardTitle>
              <CardDescription>Known entities and labels associated with this wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <EntityLabels walletAddress={finalWalletAddress} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
