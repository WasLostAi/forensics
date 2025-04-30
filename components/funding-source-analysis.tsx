"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { AlertTriangle } from "lucide-react"
import { getTransactionFlowData } from "@/lib/solana"
import { analyzeFundingSources } from "@/lib/analysis"
import { shortenAddress } from "@/lib/utils"

interface FundingSourceAnalysisProps {
  walletAddress: string
}

export function FundingSourceAnalysis({ walletAddress }: FundingSourceAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [fundingData, setFundingData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFundingData() {
      setIsLoading(true)
      setError(null)
      try {
        // Get transaction flow data
        const flowData = await getTransactionFlowData(walletAddress)

        // Analyze funding sources
        const fundingSources = analyzeFundingSources(flowData, walletAddress)
        setFundingData(fundingSources)
      } catch (error) {
        console.error("Failed to analyze funding sources:", error)
        setError("Failed to analyze funding sources. Using demonstration data.")

        // Mock data for demo purposes
        setFundingData({
          sources: [
            { address: "wallet1", label: "Binance Hot Wallet", amount: 75.5, percentage: 52.1, isHighRisk: false },
            { address: "wallet2", label: "Unknown Wallet", amount: 35.2, percentage: 24.3, isHighRisk: false },
            { address: "wallet3", label: "Mixer Output", amount: 20.8, percentage: 14.4, isHighRisk: true },
            { address: "wallet4", label: "DEX", amount: 13.2, percentage: 9.2, isHighRisk: false },
          ],
          totalIncoming: 144.7,
          largestSource: {
            address: "wallet1",
            label: "Binance Hot Wallet",
            amount: 75.5,
            percentage: 52.1,
            isHighRisk: false,
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFundingData()
  }, [walletAddress])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center border rounded-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!fundingData || fundingData.sources.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center border rounded-md">
        <p className="text-muted-foreground">No funding source data available</p>
      </div>
    )
  }

  // Check if there are any high-risk sources
  const hasHighRiskSources = fundingData.sources.some((source: any) => source.isHighRisk)

  // Colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
  const HIGH_RISK_COLOR = "#EF4444"

  // Prepare data for pie chart
  const pieChartData = fundingData.sources.map((source: any, index: number) => ({
    name: source.label,
    value: source.amount,
    color: source.isHighRisk ? HIGH_RISK_COLOR : COLORS[index % COLORS.length],
  }))

  // Prepare data for bar chart
  const barChartData = [...fundingData.sources].sort((a, b) => a.amount - b.amount)

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Funding Source Overview</CardTitle>
          <CardDescription>Analysis of where funds in this wallet originated from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Total Incoming Funds</h3>
              <p className="text-3xl font-bold">{fundingData.totalIncoming.toFixed(2)} SOL</p>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Largest Source</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={fundingData.largestSource.isHighRisk ? "destructive" : "outline"}>
                    {fundingData.largestSource.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {fundingData.largestSource.amount.toFixed(2)} SOL ({fundingData.largestSource.percentage.toFixed(1)}
                    %)
                  </span>
                </div>
              </div>

              {hasHighRiskSources && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>High Risk Funding Sources Detected</AlertTitle>
                  <AlertDescription>
                    This wallet has received funds from potentially suspicious sources
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)} SOL`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sources">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sources">Funding Sources</TabsTrigger>
          <TabsTrigger value="timeline">Funding Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Funding Sources</CardTitle>
              <CardDescription>Breakdown of all sources of funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundingData.sources.map((source: any, index: number) => (
                  <div key={source.address} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={source.isHighRisk ? "destructive" : "outline"}
                          className="h-2 w-2 p-0 rounded-full"
                        />
                        <span className="font-medium">{source.label}</span>
                        {source.isHighRisk && <Badge variant="destructive">High Risk</Badge>}
                      </div>
                      <div className="text-sm font-medium">{source.amount.toFixed(2)} SOL</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={source.percentage} className="h-2" />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {source.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{shortenAddress(source.address)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Funding Timeline</CardTitle>
              <CardDescription>How funding has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => `${value.toFixed(2)} SOL`} />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Amount (SOL)"
                      fill="#8884d8"
                      background={{ fill: "#eee" }}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
