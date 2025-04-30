"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Users, Wallet, ArrowRightLeft } from "lucide-react"
import { detectWalletClusters, detectBundledRug, checkLiquidityRemoval, getTokenHolders } from "@/lib/solana"
import { HolderDistribution } from "@/components/holder-distribution"

interface TokenAnalysisProps {
  tokenAddress: string
}

export function TokenAnalysis({ tokenAddress }: TokenAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [riskScore, setRiskScore] = useState(0)
  const [hasWalletClusters, setHasWalletClusters] = useState(false)
  const [hasBundledRug, setHasBundledRug] = useState(false)
  const [hasLiquidityRisk, setHasLiquidityRisk] = useState(false)
  const [holders, setHolders] = useState<string[]>([])

  useEffect(() => {
    async function analyzeToken() {
      setIsLoading(true)
      try {
        // Run all checks in parallel
        const [walletClusters, bundledRug, liquidityRisk, tokenHolders] = await Promise.all([
          detectWalletClusters(tokenAddress),
          detectBundledRug(tokenAddress),
          checkLiquidityRemoval(tokenAddress),
          getTokenHolders(tokenAddress),
        ])

        setHasWalletClusters(walletClusters)
        setHasBundledRug(bundledRug)
        setHasLiquidityRisk(liquidityRisk)
        setHolders(tokenHolders)

        // Calculate risk score (0-100)
        let score = 0
        if (walletClusters) score += 30
        if (bundledRug) score += 40
        if (liquidityRisk) score += 30
        setRiskScore(score)
      } catch (error) {
        console.error("Failed to analyze token:", error)
      } finally {
        setIsLoading(false)
      }
    }

    analyzeToken()
  }, [tokenAddress])

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: "High", color: "destructive" }
    if (score >= 30) return { level: "Medium", color: "warning" }
    return { level: "Low", color: "success" }
  }

  const risk = getRiskLevel(riskScore)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Token Risk Analysis</CardTitle>
            <CardDescription>Analyzing token for potential risks...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Token Risk Analysis
                <Badge variant={risk.color as "destructive" | "warning" | "outline"}>{risk.level} Risk</Badge>
              </CardTitle>
              <CardDescription>Analysis of potential risks associated with this token</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm font-medium">{riskScore}/100</span>
              </div>
              <Progress value={riskScore} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Alert variant={hasWalletClusters ? "destructive" : "default"}>
                <div className="flex items-center gap-2">
                  {hasWalletClusters ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertTitle>Wallet Clusters</AlertTitle>
                </div>
                <AlertDescription>
                  {hasWalletClusters
                    ? "Suspicious wallet clustering detected"
                    : "No suspicious wallet clustering found"}
                </AlertDescription>
              </Alert>

              <Alert variant={hasBundledRug ? "destructive" : "default"}>
                <div className="flex items-center gap-2">
                  {hasBundledRug ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertTitle>Bundled Transactions</AlertTitle>
                </div>
                <AlertDescription>
                  {hasBundledRug
                    ? "Suspicious bundled transactions detected"
                    : "No suspicious bundled transactions found"}
                </AlertDescription>
              </Alert>

              <Alert variant={hasLiquidityRisk ? "destructive" : "default"}>
                <div className="flex items-center gap-2">
                  {hasLiquidityRisk ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertTitle>Liquidity Risk</AlertTitle>
                </div>
                <AlertDescription>
                  {hasLiquidityRisk ? "90%+ LP tokens held by creator" : "Liquidity appears well distributed"}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="holders">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="holders">
            <Users className="mr-2 h-4 w-4" />
            Token Holders
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="liquidity">
            <Wallet className="mr-2 h-4 w-4" />
            Liquidity Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Holder Distribution</CardTitle>
              <CardDescription>Analysis of token holder distribution and concentration</CardDescription>
            </CardHeader>
            <CardContent>
              <HolderDistribution tokenAddress={tokenAddress} holders={holders} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analysis</CardTitle>
              <CardDescription>Analysis of token transactions and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Transaction analysis will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity Analysis</CardTitle>
              <CardDescription>Analysis of token liquidity and pool activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Liquidity analysis will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
