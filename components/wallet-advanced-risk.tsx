"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Shield } from "lucide-react"

interface WalletAdvancedRiskProps {
  walletAddress: string
}

export function WalletAdvancedRisk({ walletAddress }: WalletAdvancedRiskProps) {
  const [loading, setLoading] = useState(true)
  const [riskScore, setRiskScore] = useState(0)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Generate a random risk score between 0 and 100
      const score = Math.floor(Math.random() * 100)
      setRiskScore(score)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [walletAddress])

  const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low"

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Analyzing wallet risk...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Advanced Risk Analysis</span>
          <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "warning" : "outline"}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of high-risk activities for wallet {walletAddress.substring(0, 6)}...
          {walletAddress.substring(walletAddress.length - 4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Overall Risk Score</h3>
              <span
                className={`text-2xl font-bold ${
                  riskLevel === "high" ? "text-red-500" : riskLevel === "medium" ? "text-yellow-500" : "text-green-500"
                }`}
              >
                {riskScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  riskLevel === "high" ? "bg-red-500" : riskLevel === "medium" ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {riskLevel !== "low" && (
            <Alert variant={riskLevel === "high" ? "destructive" : "warning"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Risk Factors Detected</AlertTitle>
              <AlertDescription>
                This wallet has been associated with high-risk activities. Exercise caution when interacting with this
                address.
              </AlertDescription>
            </Alert>
          )}

          {riskLevel === "low" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Shield className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">No Risk Factors Detected</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                This wallet does not show patterns consistent with high-risk activities.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
