import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletOverview } from "@/components/wallet-overview"
import { TransactionFlow } from "@/components/transaction-flow"
import { TransactionList } from "@/components/transaction-list"
import { TransactionClustersView } from "@/components/transaction-clusters-view"
import { WalletRiskScore } from "@/components/wallet-risk-score"
import { TransactionRiskAnalysis } from "@/components/transaction-risk-analysis"
import { RiskMetricsDashboard } from "@/components/risk-metrics-dashboard"

interface WalletPageProps {
  params: {
    address: string
  }
}

export default function WalletPage({ params }: WalletPageProps) {
  const { address } = params

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Wallet Analysis</h1>
      <p className="text-muted-foreground">Detailed analysis for wallet {address}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WalletOverview address={address} />
        </div>
        <div>
          <WalletRiskScore walletAddress={address} />
        </div>
      </div>

      <Tabs defaultValue="flow">
        <TabsList>
          <TabsTrigger value="flow">Transaction Flow</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="flow" className="mt-6">
          <TransactionFlow walletAddress={address} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-6">
          <TransactionList walletAddress={address} />
        </TabsContent>
        <TabsContent value="clusters" className="mt-6">
          <TransactionClustersView walletAddress={address} />
        </TabsContent>
        <TabsContent value="risk" className="mt-6 space-y-6">
          <TransactionRiskAnalysis walletAddress={address} />
          <RiskMetricsDashboard walletAddress={address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
