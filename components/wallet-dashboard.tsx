"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionList } from "@/components/transaction-list"
import { TransactionFlow } from "@/components/transaction-flow"
import { WalletOverview } from "@/components/wallet-overview"
import { WalletRiskScore } from "@/components/wallet-risk-score"
import { FundingSourceAnalysis } from "@/components/funding-source-analysis"
import { TransactionClusters } from "@/components/transaction-clusters"
import { EmptyState } from "@/components/empty-state"
import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface WalletDashboardProps {
  address: string
}

export function WalletDashboard({ address }: WalletDashboardProps) {
  const { apiStatus } = useSettings()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-7 w-1/3 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (apiStatus === "invalid") {
    return (
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Credentials Invalid</AlertTitle>
        <AlertDescription>
          Your API credentials are invalid or missing. Please update your credentials in the settings.
        </AlertDescription>
      </Alert>
    )
  }

  if (apiStatus === "network-error") {
    return (
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Network Error</AlertTitle>
        <AlertDescription>
          Cannot connect to the API. Check your internet connection or try again later.
        </AlertDescription>
      </Alert>
    )
  }

  if (!address) {
    return <EmptyState title="No Wallet Selected" description="Please enter a wallet address to analyze" />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WalletOverview address={address} />
        <WalletRiskScore address={address} />
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="flow">Transaction Flow</TabsTrigger>
          <TabsTrigger value="funding">Funding Sources</TabsTrigger>
          <TabsTrigger value="clusters">Transaction Clusters</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <TransactionList walletAddress={address} />
        </TabsContent>
        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Flow</CardTitle>
              <CardDescription>Visualize the flow of funds to and from this wallet</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TransactionFlow walletAddress={address} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="funding" className="space-y-4">
          <FundingSourceAnalysis walletAddress={address} />
        </TabsContent>
        <TabsContent value="clusters" className="space-y-4">
          <TransactionClusters walletAddress={address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
