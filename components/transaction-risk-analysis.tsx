"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Search, ArrowUpDown, Eye, Clock, DollarSign, AlertCircle } from "lucide-react"
import { RiskScoringService } from "@/lib/risk-scoring-service"
import { getTransactionFlowData } from "@/lib/solana"
import type { TransactionRiskScore } from "@/types/risk"

interface TransactionRiskAnalysisProps {
  walletAddress: string
}

export function TransactionRiskAnalysis({ walletAddress }: TransactionRiskAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [riskScores, setRiskScores] = useState<TransactionRiskScore[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "risk">("risk")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all")

  useEffect(() => {
    async function loadTransactionRisk() {
      setLoading(true)
      setError(null)
      try {
        // Get transaction flow data
        const flowData = await getTransactionFlowData(walletAddress)

        // Extract transactions from flow data
        const txs = flowData.links.map((link, index) => ({
          id: `tx-${index}`,
          source: link.source,
          target: link.target,
          value: link.value,
          timestamp: link.timestamp || new Date().toISOString(),
        }))

        setTransactions(txs)

        // Calculate risk scores for each transaction
        const scores = txs.map((tx) => RiskScoringService.calculateTransactionRiskScore(tx.id, tx, flowData))

        setRiskScores(scores)
      } catch (error) {
        console.error("Failed to load transaction risk:", error)
        setError("Failed to analyze transaction risk. Using demonstration data.")

        // Mock data for demo purposes
        const mockTransactions = Array(10)
          .fill(0)
          .map((_, i) => ({
            id: `tx-${i}`,
            source: walletAddress,
            target: `wallet${i + 1}`,
            value: Math.random() * 100,
            timestamp: new Date(Date.now() - i * 86400000).toISOString(),
          }))

        setTransactions(mockTransactions)

        const mockScores = mockTransactions.map((tx, i) => ({
          id: tx.id,
          score: i === 0 ? 85 : i === 1 ? 65 : i === 2 ? 45 : Math.floor(Math.random() * 40),
          level: i === 0 ? "high" : i === 1 ? "medium" : i === 2 ? "medium" : "low",
          factors: [
            {
              name: i === 0 ? "Large Amount" : i === 1 ? "Unusual Hour" : "Round Number",
              description:
                i === 0
                  ? "Transaction amount is unusually large"
                  : i === 1
                    ? "Transaction occurred during unusual hours"
                    : "Transaction amount is a suspiciously round number",
              impact: i === 0 ? 20 : i === 1 ? 15 : 10,
              score: i === 0 ? 100 : i === 1 ? 75 : 50,
            },
            {
              name: i === 0 ? "Known Pattern" : "Multi-Hop Transaction",
              description:
                i === 0 ? "Part of a known suspicious pattern: Layering" : "Part of a multi-hop transaction chain",
              impact: i === 0 ? 25 : 10,
              score: i === 0 ? 100 : 50,
            },
          ],
          timestamp: tx.timestamp,
        }))

        setRiskScores(mockScores)
      } finally {
        setLoading(false)
      }
    }

    loadTransactionRisk()
  }, [walletAddress])

  // Filter transactions based on search query and risk level
  const filteredTransactions = transactions
    .filter((tx) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          tx.id.toLowerCase().includes(query) ||
          tx.source.toLowerCase().includes(query) ||
          tx.target.toLowerCase().includes(query) ||
          tx.value.toString().includes(query)
        )
      }
      return true
    })
    .filter((tx) => {
      // Filter by risk level
      if (riskFilter === "all") return true

      const riskScore = riskScores.find((score) => score.id === tx.id)
      if (!riskScore) return false

      return riskScore.level === riskFilter
    })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aScore = riskScores.find((score) => score.id === a.id)
    const bScore = riskScores.find((score) => score.id === b.id)

    if (sortBy === "date") {
      const aDate = new Date(a.timestamp).getTime()
      const bDate = new Date(b.timestamp).getTime()
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate
    }

    if (sortBy === "amount") {
      return sortDirection === "asc" ? a.value - b.value : b.value - a.value
    }

    // Sort by risk score
    const aRisk = aScore ? aScore.score : 0
    const bRisk = bScore ? bScore.score : 0
    return sortDirection === "asc" ? aRisk - bRisk : bRisk - aRisk
  })

  const toggleSort = (field: "date" | "amount" | "risk") => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortDirection("desc")
    }
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Analyzing transaction risk...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && transactions.length === 0) {
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No transactions found for this wallet</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Risk Analysis</CardTitle>
        <CardDescription>Risk assessment for individual transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs
              defaultValue="all"
              value={riskFilter}
              onValueChange={(value) => setRiskFilter(value as any)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high" className="text-red-500">
                  High Risk
                </TabsTrigger>
                <TabsTrigger value="medium" className="text-yellow-500">
                  Medium
                </TabsTrigger>
                <TabsTrigger value="low" className="text-green-500">
                  Low
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold">{riskScores.filter((score) => score.level === "high").length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-yellow-500/10 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medium Risk</p>
                  <p className="text-2xl font-bold">{riskScores.filter((score) => score.level === "medium").length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Risk</p>
                  <p className="text-2xl font-bold">{riskScores.filter((score) => score.level === "low").length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 -ml-3"
                      onClick={() => toggleSort("date")}
                    >
                      <Clock className="h-4 w-4" />
                      Date
                      {sortBy === "date" && <ArrowUpDown className="h-3 w-3 text-muted-foreground" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 -ml-3"
                      onClick={() => toggleSort("amount")}
                    >
                      <DollarSign className="h-4 w-4" />
                      Amount
                      {sortBy === "amount" && <ArrowUpDown className="h-3 w-3 text-muted-foreground" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 -ml-3"
                      onClick={() => toggleSort("risk")}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Risk Score
                      {sortBy === "risk" && <ArrowUpDown className="h-3 w-3 text-muted-foreground" />}
                    </Button>
                  </TableHead>
                  <TableHead>Risk Factors</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transactions matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map((tx) => {
                    const riskScore = riskScores.find((score) => score.id === tx.id)

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          <div className="font-mono text-xs">{tx.id}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {tx.source.substring(0, 6)}...{tx.source.substring(tx.source.length - 4)} →{" "}
                            {tx.target.substring(0, 6)}...{tx.target.substring(tx.target.length - 4)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{tx.value.toFixed(2)} SOL</TableCell>
                        <TableCell>
                          {riskScore ? (
                            <div className="flex items-center gap-2">
                              <Badge variant={getRiskBadgeVariant(riskScore.level)}>{riskScore.score}</Badge>
                              <div className="text-xs">{riskScore.level.toUpperCase()}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {riskScore && riskScore.factors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {riskScore.factors.slice(0, 2).map((factor, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {factor.name}
                                </Badge>
                              ))}
                              {riskScore.factors.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{riskScore.factors.length - 2} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No risk factors</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
