"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Network, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TransactionCluster {
  id: string
  name: string
  description: string
  walletCount: number
  transactionCount: number
  totalValue: number
  riskLevel: "low" | "medium" | "high"
  patternType: string
}

interface TransactionClustersViewProps {
  walletAddress: string
}

export function TransactionClustersView({ walletAddress }: TransactionClustersViewProps) {
  const [loading, setLoading] = useState(false)
  const [clusters, setClusters] = useState<TransactionCluster[]>([
    {
      id: "cluster-1",
      name: "Circular Transactions",
      description: "A series of transactions that form a circular pattern",
      walletCount: 4,
      transactionCount: 6,
      totalValue: 120.5,
      riskLevel: "high",
      patternType: "circular",
    },
    {
      id: "cluster-2",
      name: "Exchange Interactions",
      description: "Transactions with known exchange wallets",
      walletCount: 3,
      transactionCount: 8,
      totalValue: 450.75,
      riskLevel: "low",
      patternType: "exchange",
    },
    {
      id: "cluster-3",
      name: "Rapid Succession",
      description: "Multiple transactions occurring within minutes",
      walletCount: 5,
      transactionCount: 12,
      totalValue: 85.25,
      riskLevel: "medium",
      patternType: "temporal",
    },
  ])

  // This would normally fetch data from an API
  // For now, we're using mock data

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Analyzing transaction clusters...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (clusters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Clusters</CardTitle>
          <CardDescription>Groups of related transactions and wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No transaction clusters found for this wallet.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Clusters</CardTitle>
        <CardDescription>Groups of related transactions and wallets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    {cluster.name}
                    <Badge
                      variant={
                        cluster.riskLevel === "high"
                          ? "destructive"
                          : cluster.riskLevel === "medium"
                            ? "default"
                            : "outline"
                      }
                    >
                      {cluster.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
                </div>
                <Network className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Wallets</div>
                  <div className="text-lg font-medium">{cluster.walletCount}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="text-lg font-medium">{cluster.transactionCount}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-lg font-medium">{cluster.totalValue} SOL</div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="gap-1">
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
