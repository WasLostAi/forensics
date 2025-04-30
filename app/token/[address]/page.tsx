import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { TokenAnalysis } from "@/components/token-analysis"

interface TokenPageProps {
  params: {
    address: string
  }
}

export default function TokenPage({ params }: TokenPageProps) {
  const tokenAddress = params.address

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Token Analysis</h1>
      <p className="text-muted-foreground font-mono text-sm mb-8 break-all">
        {tokenAddress}
        <Button variant="ghost" size="icon" asChild className="ml-2">
          <a href={`https://explorer.solana.com/address/${tokenAddress}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View on Solana Explorer</span>
          </a>
        </Button>
      </p>

      <Suspense fallback={<div className="mt-8 text-center">Loading token data...</div>}>
        <TokenAnalysis tokenAddress={tokenAddress} />
      </Suspense>
    </main>
  )
}
