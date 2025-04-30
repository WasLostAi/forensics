"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, Clock, DollarSign, RefreshCcw } from "lucide-react"
import { shortenAddress } from "@/lib/utils"
import { getTransactionFlowData } from "@/lib/solana"
import { identifyTransactionClusters } from "@/lib/analysis"

interface TransactionClustersProps {
  walletAddress: string
}

export function TransactionClusters({ walletAddress }: TransactionClustersProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [clusters, setClusters] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadClusters() {
      setIsLoading(true)
      setError(null)
      try {
        // Get transaction flow data
        const flowData = await getTransactionFlowData(walletAddress)

        // Identify clusters using our new algorithm
        const detectedClusters = identifyTransactionClusters(flowData)

        setClusters(detectedClusters)
      } catch (error) {
        console.error("Failed to load transaction clusters:", error)
        setError("Failed to analyze transaction clusters. Using demonstration data.")

        // Mock data for demo purposes
        const mockClusters = [
          {
            id: "cluster1",
            name: "Exchange Deposits",
            type: "time-based",
            wallets: [
              { address: "wallet1", label: "Binance Hot Wallet", risk: "low" },
              { address: "wallet2", label: "Unknown Wallet", risk: "medium" },
              { address: walletAddress, label: "Main Wallet", risk: "low" },
            ],
            transactions: 12,
            volume: 145.72,
            timeframe: "2023-09-15 to 2023-10-22",
            risk: "low",
          },
          {
            id: "cluster2",
            name: "Suspicious Activity",
            type: "circular-pattern",
            wallets: [
              { address: "wallet3", label: "Mixer Input", risk: "high" },
              { address: "wallet4", label: "Mixer Output", risk: "high" },
              { address: walletAddress, label: "Main Wallet", risk: "low" },
            ],
            transactions: 5,
            volume: 23.4,
            timeframe: "2023-10-18 to 2023-10-20",
            risk: "high",
          },
          {
            id: "cluster3",
            name: "Similar Value Transfers",
            type: "value-based",
            wallets: [
              { address: "wallet5", label: "NFT Marketplace", risk: "low" },
              { address: "wallet6", label: "NFT Collector", risk: "low" },
              { address: walletAddress, label: "Main Wallet", risk: "low" },
            ],
            transactions: 8,
            volume: 12.5,
            timeframe: "2023-10-01 to 2023-10-15",
            risk: "low",
          },
        ]

        setClusters(mockClusters)
      } finally {
        setIsLoading(false)
      }
    }

    loadClusters()
  }, [walletAddress])

  const getClusterIcon = (type: string) => {
    switch (type) {
      case "time-based":
        return <Clock className="h-4 w-4" />
      case "value-based":
        return <DollarSign className="h-4 w-4" />
      case "circular-pattern":
        return <RefreshCcw className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center border rounded-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (clusters.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center border rounded-md">
        <p className="text-muted-foreground">No transaction clusters found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {clusters.map((cluster) => (
        <Card key={cluster.id} className={cluster.risk === "high" ? "border-red-500" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getClusterIcon(cluster.type)}
                  {cluster.name}
                  <Badge
                    variant={
                      cluster.risk === "high" ? "destructive" : cluster.risk === "medium" ? "warning" : "outline"
                    }
                  >
                    {cluster.risk === "high" ? "High Risk" : cluster.risk === "medium" ? "Medium Risk" : "Low Risk"}
                  </Badge>
                </CardTitle>
                <CardDescription>{cluster.timeframe}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {typeof cluster.transactions === "number" ? cluster.transactions : cluster.transactions.length}{" "}
                  Transactions
                </div>
                <div className="text-sm text-muted-foreground">
                  {typeof cluster.volume === "number"
                    ? cluster.volume
                    : cluster.transactions.reduce((sum: number, tx: any) => sum + tx.value, 0).toFixed(2)}{" "}
                  SOL
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cluster.risk === "high" && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>High Risk Cluster</AlertTitle>
                <AlertDescription>
                  This transaction cluster contains high-risk wallets or suspicious patterns
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Wallets in this cluster:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Array.isArray(cluster.wallets) &&
                  cluster.wallets.map((wallet: any) => (
                    <div
                      key={typeof wallet === "string" ? wallet : wallet.address}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            (typeof wallet === "string" ? "low" : wallet.risk) === "high" ? "destructive" : "outline"
                          }
                          className="h-2 w-2 p-0 rounded-full"
                        />
                        <span className="font-medium">
                          {typeof wallet === "string" ? `Wallet ${wallet.substring(0, 4)}` : wallet.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {shortenAddress(typeof wallet === "string" ? wallet : wallet.address)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Info className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
