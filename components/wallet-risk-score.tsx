"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldQuestion, Info, Brain } from "lucide-react"
import type { WalletRiskProfile } from "@/types/risk"
import { PatternVisualization } from "./pattern-visualization"
import { MLPatternVisualization } from "./ml-pattern-visualization"

interface WalletRiskScoreProps {
  riskProfile: WalletRiskProfile
  walletAddress: string
}

export function WalletRiskScore({ riskProfile, walletAddress }: WalletRiskScoreProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getRiskIcon = () => {
    switch (riskProfile.riskLevel) {
      case "high":
        return <ShieldAlert className="h-8 w-8 text-destructive" />
      case "medium":
        return <AlertTriangle className="h-8 w-8 text-amber-500" />
      case "low":
        return <ShieldCheck className="h-8 w-8 text-green-500" />
      default:
        return <ShieldQuestion className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getRiskColor = () => {
    switch (riskProfile.riskLevel) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBgColor = () => {
    switch (riskProfile.riskLevel) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-muted"
    }
  }

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Risk Assessment</CardTitle>
          <CardDescription>Comprehensive risk analysis for {walletAddress}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                {getRiskIcon()}
                <div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div className={`text-2xl font-bold ${getRiskColor()}`}>{riskProfile.riskLevel.toUpperCase()}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className="text-sm font-bold">{riskProfile.riskScore}/100</span>
                </div>
                <Progress value={riskProfile.riskScore} className="h-2" />
              </div>

              <div className="text-sm text-muted-foreground mb-2">Last Updated</div>
              <div className="text-sm">{new Date(riskProfile.lastUpdated).toLocaleString()}</div>
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Key Risk Factors</div>
              <div className="space-y-2">
                {riskProfile.riskFactors
                  .sort((a, b) => b.impact - a.impact)
                  .slice(0, 3)
                  .map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1 h-6 rounded-full ${
                            factor.severity === "high"
                              ? "bg-destructive"
                              : factor.severity === "medium"
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium">{factor.name}</div>
                          <div className="text-xs text-muted-foreground">{factor.description}</div>
                        </div>
                      </div>
                      <Badge variant={getBadgeVariant(factor.severity)}>{factor.severity}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">
            <Info className="h-4 w-4 mr-2" />
            Risk Factors
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Pattern Analysis
          </TabsTrigger>
          <TabsTrigger value="ml">
            <Brain className="h-4 w-4 mr-2" />
            ML Analysis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
              <CardDescription>
                {riskProfile.riskFactors.length} risk factors identified for this wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskProfile.riskFactors.length > 0 ? (
                  riskProfile.riskFactors
                    .sort((a, b) => b.impact - a.impact)
                    .map((factor, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1 h-6 rounded-full ${
                                factor.severity === "high"
                                  ? "bg-destructive"
                                  : factor.severity === "medium"
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{factor.name}</div>
                              <div className="text-xs text-muted-foreground">{factor.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(factor.severity)}>{factor.severity}</Badge>
                            <div className="text-xs font-medium">Impact: {factor.impact}%</div>
                          </div>
                        </div>
                        {factor.details && factor.details.length > 0 && (
                          <div className="p-3 pt-0 border-t">
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Details</div>
                              <ul className="text-xs list-disc list-inside">
                                {factor.details.map((detail, i) => (
                                  <li key={i}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-center text-muted-foreground p-4">No risk factors identified</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="patterns" className="mt-4">
          {riskProfile.detectedPatterns && riskProfile.detectedPatterns.length > 0 ? (
            <PatternVisualization patterns={riskProfile.detectedPatterns} walletAddress={walletAddress} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pattern Analysis</CardTitle>
                <CardDescription>No suspicious patterns detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 text-muted-foreground">
                  No suspicious patterns were detected in the transaction history
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="ml" className="mt-4">
          <MLPatternVisualization
            patterns={riskProfile.mlPatterns || []}
            modelMetadata={riskProfile.modelMetadata}
            walletAddress={walletAddress}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
