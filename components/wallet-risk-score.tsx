"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, TrendingUp, Info, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { RiskScoringService } from "@/lib/risk-scoring-service"
import { fetchWalletOverview } from "@/lib/api"
import { getTransactionFlowData } from "@/lib/solana"
import type { RiskScore, RiskFactor } from "@/types/risk"

interface WalletRiskScoreProps {
  walletAddress: string
}

export function WalletRiskScore({ walletAddress }: WalletRiskScoreProps) {
  const [loading, setLoading] = useState(true)
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedFactors, setExpandedFactors] = useState<string[]>([])

  useEffect(() => {
    async function loadRiskScore() {
      setLoading(true)
      setError(null)
      try {
        // Get wallet data and transaction flow data
        const walletData = await fetchWalletOverview(walletAddress)
        const flowData = await getTransactionFlowData(walletAddress)

        // Calculate risk score
        const score = RiskScoringService.calculateWalletRiskScore(walletAddress, walletData, flowData)

        setRiskScore(score)
      } catch (error) {
        console.error("Failed to load risk score:", error)
        setError("Failed to calculate risk score. Using demonstration data.")

        // Mock data for demo purposes
        setRiskScore({
          address: walletAddress,
          score: 65,
          level: "medium",
          factors: [
            {
              name: "Connection to High-Risk Wallets",
              description: "Connected to 2 high-risk wallets",
              impact: 20,
              score: 60,
              details: ["wallet4", "wallet7"],
            },
            {
              name: "Unusual Transaction Patterns",
              description: "Multiple transactions with unusual timing",
              impact: 15,
              score: 75,
            },
            {
              name: "Transaction Velocity",
              description: "High number of transactions in a short time period",
              impact: 10,
              score: 50,
            },
            {
              name: "Circular Transactions",
              description: "1 circular transaction pattern detected",
              impact: 10,
              score: 40,
            },
            {
              name: "Unusual Amounts",
              description: "3 transactions with unusual amounts",
              impact: 5,
              score: 30,
            },
            {
              name: "New Wallet",
              description: "Recently created wallet with high activity",
              impact: 5,
              score: 25,
            },
          ],
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    loadRiskScore()
  }, [walletAddress])

  const toggleFactor = (factorName: string) => {
    setExpandedFactors((prev) =>
      prev.includes(factorName) ? prev.filter((f) => f !== factorName) : [...prev, factorName],
    )
  }

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

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Calculating risk score...</p>
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
            <AlertDescription>No risk data available for this wallet</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Risk Assessment</span>
          <Badge variant={getRiskBadgeVariant(riskScore.level)}>{riskScore.level.toUpperCase()} RISK</Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive risk analysis for wallet {walletAddress.substring(0, 6)}...
          {walletAddress.substring(walletAddress.length - 4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Risk Score Gauge */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Risk Score</h3>
              <span className={`text-2xl font-bold ${getRiskColor(riskScore.level)}`}>{riskScore.score}/100</span>
            </div>
            <Progress
              value={riskScore.score}
              max={100}
              className="h-3"
              indicatorClassName={getProgressColor(riskScore.score)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <h3 className="text-sm font-medium mb-3">Risk Factors</h3>
            <div className="space-y-3">
              {riskScore.factors.map((factor) => (
                <RiskFactorCard
                  key={factor.name}
                  factor={factor}
                  isExpanded={expandedFactors.includes(factor.name)}
                  onToggle={() => toggleFactor(factor.name)}
                />
              ))}
            </div>
          </div>

          {/* Risk Trend */}
          <div>
            <h3 className="text-sm font-medium mb-3">Risk Trend</h3>
            <div className="p-4 border rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Stable Risk Profile</div>
                  <div className="text-xs text-muted-foreground">No significant changes in the last 30 days</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                +2% change
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RiskFactorCardProps {
  factor: RiskFactor
  isExpanded: boolean
  onToggle: () => void
}

function RiskFactorCard({ factor, isExpanded, onToggle }: RiskFactorCardProps) {
  const getImpactColor = (impact: number) => {
    if (impact >= 15) return "text-red-500"
    if (impact >= 10) return "text-yellow-500"
    return "text-muted-foreground"
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-6 rounded-full"
            style={{
              backgroundColor:
                factor.impact >= 15
                  ? "rgb(239, 68, 68)"
                  : factor.impact >= 10
                    ? "rgb(234, 179, 8)"
                    : "rgb(34, 197, 94)",
            }}
          />
          <div>
            <div className="font-medium">{factor.name}</div>
            <div className="text-xs text-muted-foreground">{factor.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${getImpactColor(factor.impact)}`}>+{factor.impact}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-t">
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Factor Score</span>
              <span className="text-sm font-medium">{factor.score}/100</span>
            </div>
            <Progress value={factor.score} max={100} className="h-2" />

            {factor.details && factor.details.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium mb-1">Related Entities</h4>
                <div className="grid grid-cols-2 gap-1">
                  {factor.details.map((detail, i) => (
                    <div key={i} className="text-xs p-1 bg-muted rounded">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
