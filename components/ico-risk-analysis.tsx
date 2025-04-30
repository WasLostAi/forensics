"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import type { ICOProject } from "@/types/monitoring"
import { MonitoringService } from "@/lib/monitoring-service"

interface ICORiskAnalysisProps {
  project: ICOProject
}

export function ICORiskAnalysis({ project }: ICORiskAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [tokenRisk, setTokenRisk] = useState<{
    riskScore: number
    riskFactors: {
      name: string
      description: string
      impact: number
    }[]
    recommendation: string
  } | null>(null)

  useEffect(() => {
    async function loadRiskAnalysis() {
      try {
        const data = await MonitoringService.analyzeTokenRisk(project.address)
        setTokenRisk(data)
      } catch (error) {
        console.error("Error loading risk analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRiskAnalysis()
  }, [project.address])

  const getRiskIcon = (score: number) => {
    if (score >= 70) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else if (score >= 40) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    } else {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) {
      return "bg-red-500"
    } else if (score >= 40) {
      return "bg-yellow-500"
    } else {
      return "bg-green-500"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tokenRisk) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Risk analysis not available</h3>
        <p className="text-muted-foreground mt-2">Unable to perform risk analysis for this project</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Risk Assessment</CardTitle>
          <CardDescription>Risk score and recommendation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Score</span>
            <span className="text-sm font-medium">{tokenRisk.riskScore}/100</span>
          </div>
          <Progress value={tokenRisk.riskScore} className={getRiskColor(tokenRisk.riskScore)} />

          <Alert
            className={`border-l-4 ${
              tokenRisk.riskScore >= 70
                ? "border-l-red-500"
                : tokenRisk.riskScore >= 40
                  ? "border-l-yellow-500"
                  : "border-l-green-500"
            }`}
          >
            <div className="flex items-start">
              {getRiskIcon(tokenRisk.riskScore)}
              <div className="ml-2">
                <AlertTitle>Recommendation</AlertTitle>
                <AlertDescription>{tokenRisk.recommendation}</AlertDescription>
              </div>
            </div>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Factors</CardTitle>
          <CardDescription>Individual factors contributing to the risk score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tokenRisk.riskFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{factor.name}</span>
                  <span className="text-sm font-medium">Impact: {factor.impact}/100</span>
                </div>
                <Progress value={factor.impact} className={getRiskColor(factor.impact)} />
                <p className="text-sm text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {project.currentStatus === "rugpull" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rug Pull Detected</AlertTitle>
          <AlertDescription>
            This project has been identified as a rug pull. Funds have been drained from the project.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
