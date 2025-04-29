import { Suspense } from "react"
import { WalletDashboard } from "@/components/wallet-dashboard"

interface WalletPageProps {
  params: {
    address: string
  }
}

export default function WalletPage({ params }: WalletPageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="mt-8 text-center">Loading wallet data...</div>}>
        <WalletDashboard walletAddress={params.address} />
      </Suspense>
    </main>
  )
}
