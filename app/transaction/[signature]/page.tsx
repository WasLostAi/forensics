import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface TransactionPageProps {
  params: {
    signature: string
  }
}

export default function TransactionPage({ params }: TransactionPageProps) {
  const signature = params.signature

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
      <p className="text-muted-foreground font-mono text-sm mb-8 break-all">
        {signature}
        <Button variant="ghost" size="icon" asChild className="ml-2">
          <a href={`https://explorer.solana.com/tx/${signature}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View on Solana Explorer</span>
          </a>
        </Button>
      </p>

      <Suspense fallback={<div className="mt-8 text-center">Loading transaction data...</div>}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>Basic information about this transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Block Time</p>
                  <p className="font-medium">March 15, 2023 14:23:45</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">0.000005 SOL</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-medium">System Program</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Detailed information about this transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-mono text-sm break-all">5xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-mono text-sm break-all">wallet1</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">5.2 SOL</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Memo</p>
                  <p className="italic text-muted-foreground">No memo provided</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Transactions</CardTitle>
              <CardDescription>Transactions related to this one</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">No related transactions found</p>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </main>
  )
}
