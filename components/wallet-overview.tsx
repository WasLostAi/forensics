"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchArkhamTransactionFlow } from "@/lib/arkham-api"
import { useSettings } from "@/contexts/settings-context"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TransactionFlowData } from "@/types/transaction"

interface WalletOverviewProps {
  address: string
}

export function WalletOverview({ address }: WalletOverviewProps) {
  const { useMockData } = useSettings()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TransactionFlowData | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!address) {
        setError("No wallet address provided")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const flowData = await fetchArkhamTransactionFlow(address, useMockData)
        setData(flowData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wallet data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [address, useMockData])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading wallet data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No data available for this wallet</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Safe way to format the address with null checks
  const formatAddress = (addr: string | undefined | null) => {
    if (!addr) return "Unknown"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Overview</CardTitle>
        <CardDescription>Analysis of wallet {formatAddress(address)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Transaction Summary</h3>
            <p className="text-sm text-muted-foreground">
              This wallet has {data.links.length} transactions with {data.nodes.length - 1} other addresses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Connected Entities</h3>
            <div className="grid gap-2 mt-2">
              {data.nodes
                .filter((node) => node.id !== address)
                .map((node) => (
                  <div key={node.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{node.label || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{formatAddress(node.id)}</p>
                    </div>
                    <div className="text-sm">Group: {node.group || "Unknown"}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
