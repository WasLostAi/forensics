"use client"

import { useParams } from "next/navigation"
import { WalletOverview } from "@/components/wallet-overview"
import { TransactionFlow } from "@/components/transaction-flow"
import { TransactionList } from "@/components/transaction-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MockModeBanner } from "@/components/mock-mode-banner"

export default function WalletPage() {
  const params = useParams()
  const address = params.address as string

  return (
    <div className="container mx-auto px-4 py-8">
      <MockModeBanner />

      <WalletOverview walletAddress={address} />

      <Tabs defaultValue="transactions" className="mt-8">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="flow">Transaction Flow</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <div className="mt-4">
            <TransactionList walletAddress={address} />
          </div>
        </TabsContent>
        <TabsContent value="flow">
          <div className="mt-4">
            <TransactionFlow walletAddress={address} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
