import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchForm } from "@/components/search-form"

export default function WalletPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Wallet Analysis</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter a Wallet Address</CardTitle>
          <CardDescription>Enter a Solana wallet address to begin your analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-20 flex items-center justify-center">Loading search...</div>}>
            <SearchForm />
          </Suspense>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground mt-8">
        <p>Enter a wallet address to view transaction flow, funding sources, and entity labels</p>
      </div>
    </main>
  )
}
