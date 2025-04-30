"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Info, ChevronDown, ChevronUp, Network } from "lucide-react"
import { identifyTransactionClusters } from "@/lib/analysis"
import { useSettings } from "@/contexts/settings-context"
import { shortenAddress } from "@/lib/utils"
import type { TransactionFlowData } from "@/types/transaction"

interface TransactionClustersViewProps {
  walletAddress: string
  flowData: TransactionFlowData
}

export function TransactionClustersView({ walletAddress, flowData }: TransactionClustersViewProps) {
  const { useMockData } = useSettings()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clusters, setClusters] = useState<any[]>([])
  const [expandedClusters, setExpandedClusters] = useState<string[]>([])

  useEffect(() => {
    async function analyzeClusters() {
      if (!flowData || !flowData.nodes || !flowData.links) {
        setError("No transaction flow data available")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Identify transaction clusters
        const clusterData = await identifyTransactionClusters(flowData)
        setClusters(clusterData)
      } catch (err) {
        console.error("Failed to analyze transaction clusters:", err)
        setError("Failed to analyze transaction clusters")
      } finally {
        setLoading(false)
      }
    }

    analyzeClusters()
  }, [flowData, useMockData])

  const toggleCluster = (clusterId: string) => {
    setExpandedClusters((prev) =>
      prev.includes(clusterId) ? prev.filter((id) => id !== clusterId) : [...prev, clusterId],
    )
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing transaction clusters...</p>
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
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!clusters || clusters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Clusters</CardTitle>
          <CardDescription>Analysis of related transaction patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>No significant transaction clusters detected.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaction Clusters</span>
          <Badge variant="secondary">{clusters.length}</Badge>
        </CardTitle>
        <CardDescription>Analysis of related transaction patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Clusters</TabsTrigger>
            <TabsTrigger value="high-risk">High Risk</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                isExpanded={expandedClusters.includes(cluster.id)}
                onToggle={() => toggleCluster(cluster.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="high-risk" className="space-y-4">
            {clusters
              .filter((cluster) => cluster.risk === "high")
              .map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  isExpanded={expandedClusters.includes(cluster.id)}
                  onToggle={() => toggleCluster(cluster.id)}
                />
              ))}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            {clusters
              .filter((cluster) => cluster.type === "circular-pattern" || cluster.type === "value-based")
              .map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  isExpanded={expandedClusters.includes(cluster.id)}
                  onToggle={() => toggleCluster(cluster.id)}
                />
              ))}
          </TabsContent>
        </Tabs>

        {useMockData && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>Using mock data for demonstration. Real transaction clusters may vary.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

interface ClusterCardProps {
  cluster: any
  isExpanded: boolean
  onToggle: () => void
}

function ClusterCard({ cluster, isExpanded, onToggle }: ClusterCardProps) {
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "circular-pattern":
        return "Circular Transactions"
      case "time-based":
        return "Temporal Pattern"
      case "value-based":
        return "Value Pattern"
      default:
        return type
    }
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-medium">{cluster.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline">{getTypeLabel(cluster.type)}</Badge>
              <span>•</span>
              <span>{cluster.transactions} transactions</span>
              {cluster.timeframe && (
                <>
                  <span>•</span>
                  <span>{cluster.timeframe}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getRiskBadgeVariant(cluster.risk)}>{cluster.risk.toUpperCase()} RISK</Badge>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-t">
          <div className="mt-2 space-y-3">
            <div className="text-sm">
              <p>{cluster.description || "A cluster of related transactions with similar characteristics."}</p>
            </div>

            {cluster.wallets && cluster.wallets.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-1">Involved Wallets</h4>
                <div className="grid grid-cols-2 gap-1">
                  {cluster.wallets.slice(0, 6).map((wallet: string, i: number) => (
                    <div key={i} className="text-xs p-1 bg-muted rounded font-mono">
                      {shortenAddress(wallet, 6)}
                    </div>
                  ))}
                  {cluster.wallets.length > 6 && (
                    <div className="text-xs p-1 bg-muted rounded">+{cluster.wallets.length - 6} more</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
