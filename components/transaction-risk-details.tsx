"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { RiskScoringService } from "@/lib/risk-scoring-service"
import { fetchTransactionFlowData } from "@/lib/api"
import type { TransactionRiskScore } from "@/types/risk"

interface TransactionRiskDetailsProps {
  transactionId: string
  transaction: any
}

export function TransactionRiskDetails({ transactionId, transaction }: TransactionRiskDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [riskScore, setRiskScore] = useState<TransactionRiskScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRiskScore() {
      setLoading(true)
      setError(null)
      try {
        // Get transaction flow data
        const flowData = await fetchTransactionFlowData(transaction.source)

        // Calculate risk score
        const score = await RiskScoringService.calculateTransactionRiskScore(transactionId, transaction, flowData)

        setRiskScore(score)
      } catch (error) {
        console.error("Failed to load transaction risk score:", error)
        setError("Failed to calculate risk score. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadRiskScore()
  }, [transactionId, transaction])

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      default:
        return "text-green-500"
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
        <CardContent className="pt-6 flex justify-center items-center min-h-[100px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Analyzing transaction risk...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !riskScore) {
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

  if (!riskScore) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>No risk data available for this transaction</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Transaction Risk</span>
          <Badge variant={getRiskBadgeVariant(riskScore.level)}>{riskScore.level.toUpperCase()} RISK</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Risk Score</span>
              <span className={`text-lg font-bold ${getRiskColor(riskScore.level)}`}>{riskScore.score}/100</span>
            </div>
            <Progress
              value={riskScore.score}
              max={100}
              className="h-2"
              indicatorClassName={
                riskScore.score >= 70 ? "bg-red-500" : riskScore.score >= 40 ? "bg-yellow-500" : "bg-green-500"
              }
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Risk Factors</h3>
            <div className="space-y-2">
              {riskScore.factors.map((factor) => (
                <div key={factor.name} className="p-2 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{factor.name}</div>
                      <div className="text-xs text-muted-foreground">{factor.description}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        factor.impact >= 15
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : factor.impact >= 10
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                      }
                    >
                      +{factor.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
