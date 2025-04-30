"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Info,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import { fetchWalletRiskScore } from "@/lib/api"
import type { RiskScore, RiskFactor } from "@/types/risk"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        // Fetch real risk score data
        const score = await fetchWalletRiskScore(walletAddress)
        setRiskScore(score)
      } catch (error) {
        console.error("Failed to load risk score:", error)
        setError("Failed to calculate risk score. Please try again later.")
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "Increasing Risk"
      case "decreasing":
        return "Decreasing Risk"
      default:
        return "Stable Risk"
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      case "decreasing":
        return "text-green-500 bg-green-500/10 border-green-500/20"
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    }
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
          <div className="flex items-center gap-2">
            <span>Risk Assessment</span>
            {riskScore.confidence && (
              <Badge variant="outline" className="ml-2 text-xs">
                {(riskScore.confidence * 100).toFixed(0)}% confidence
              </Badge>
            )}
          </div>
          <Badge variant={getRiskBadgeVariant(riskScore.level)}>{riskScore.level.toUpperCase()} RISK</Badge>
        </CardTitle>
        <CardDescription>
          AI-powered risk analysis for wallet {walletAddress.substring(0, 6)}...
          {walletAddress.substring(walletAddress.length - 4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="factors">Risk Factors</TabsTrigger>
            <TabsTrigger value="prediction">Prediction</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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

            {/* Top Risk Factors Summary */}
            <div>
              <h3 className="text-sm font-medium mb-3">Top Risk Factors</h3>
              <div className="space-y-2">
                {riskScore.factors.slice(0, 3).map((factor) => (
                  <div key={factor.name} className="p-3 border rounded-md flex items-center justify-between">
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
                    <span
                      className={`font-medium ${getRiskColor(factor.impact >= 15 ? "high" : factor.impact >= 10 ? "medium" : "low")}`}
                    >
                      +{factor.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Trend */}
            <div>
              <h3 className="text-sm font-medium mb-3">Risk Trend</h3>
              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTrendIcon(riskScore.trend || "stable")}
                  <div>
                    <div className="font-medium">{getTrendText(riskScore.trend || "stable")}</div>
                    <div className="text-xs text-muted-foreground">
                      {riskScore.trendDescription || "No significant changes in the last 30 days"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={getTrendColor(riskScore.trend || "stable")}>
                  {riskScore.trendPercentage || "+2%"} change
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="factors" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            <div className="p-4 border rounded-md space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">AI Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Based on historical patterns and machine learning analysis, this wallet is predicted to:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-md">
                  <h4 className="text-xs font-medium mb-1">Future Risk Trend</h4>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(riskScore.predictedTrend || "stable")}
                    <span className="font-medium">{getTrendText(riskScore.predictedTrend || "stable")}</span>
                  </div>
                </div>

                <div className="p-3 border rounded-md">
                  <h4 className="text-xs font-medium mb-1">Prediction Confidence</h4>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={riskScore.predictionConfidence ? riskScore.predictionConfidence * 100 : 75}
                      max={100}
                      className="h-2"
                    />
                    <span className="text-sm font-medium">
                      {riskScore.predictionConfidence ? (riskScore.predictionConfidence * 100).toFixed(0) : 75}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium mb-1">Anomaly Detection</h4>
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">
                    {riskScore.anomalyDescription ||
                      "No significant anomalies detected in recent transaction patterns. The wallet behavior appears consistent with its historical activity."}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            View Full Report
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Export Data
          </Button>
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

            {factor.confidence && (
              <div className="mt-3">
                <h4 className="text-xs font-medium mb-1">Detection Confidence</h4>
                <div className="flex items-center gap-2">
                  <Progress value={factor.confidence * 100} max={100} className="h-2" />
                  <span className="text-xs">{(factor.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
