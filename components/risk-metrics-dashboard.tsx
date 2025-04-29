"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AlertTriangle, TrendingUp, Shield, Activity } from "lucide-react"

interface RiskMetricsDashboardProps {
  walletAddress: string
}

export function RiskMetricsDashboard({ walletAddress }: RiskMetricsDashboardProps) {
  // Mock data for demonstration
  const riskTrendData = [
    { date: "Jan", score: 25 },
    { date: "Feb", score: 30 },
    { date: "Mar", score: 45 },
    { date: "Apr", score: 40 },
    { date: "May", score: 55 },
    { date: "Jun", score: 65 },
  ]

  const riskFactorsData = [
    { name: "High-Risk Connections", value: 20 },
    { name: "Transaction Velocity", value: 15 },
    { name: "Unusual Patterns", value: 15 },
    { name: "Circular Transactions", value: 10 },
    { name: "Unusual Amounts", value: 5 },
  ]

  const transactionRiskData = [
    { name: "High Risk", value: 2 },
    { name: "Medium Risk", value: 5 },
    { name: "Low Risk", value: 18 },
  ]

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Metrics Dashboard</CardTitle>
        <CardDescription>
          Comprehensive risk metrics and trends for wallet {walletAddress.substring(0, 6)}...
          {walletAddress.substring(walletAddress.length - 4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Risk Trends</TabsTrigger>
            <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Risk Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-sm text-muted-foreground mb-2">Overall Risk Score</div>
                    <div className="text-4xl font-bold text-yellow-500">65</div>
                    <Badge variant="warning" className="mt-2">
                      MEDIUM RISK
                    </Badge>
                    <div className="w-full mt-4">
                      <Progress value={65} max={100} className="h-2" indicatorClassName="bg-yellow-500" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="text-sm text-muted-foreground mb-2">Risk Trend</div>
                    <div className="flex-1 min-h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={riskTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">Increasing Risk (+40%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="text-sm text-muted-foreground mb-2">Transaction Risk Distribution</div>
                    <div className="flex-1 min-h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={transactionRiskData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {transactionRiskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm">2 High Risk Transactions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Risk Factors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Risk Factors</CardTitle>
                <CardDescription>Factors contributing to the overall risk score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Impact Score",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskFactorsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 25]} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" barSize={20} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 mt-4">
            {/* Risk Trend Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Risk Score Trend</CardTitle>
                <CardDescription>6-month historical risk score trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 border rounded-md">
                    <div className="text-xs text-muted-foreground">Starting Risk</div>
                    <div className="text-lg font-medium">25</div>
                    <Badge variant="outline" className="mt-1">
                      LOW
                    </Badge>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="text-xs text-muted-foreground">Current Risk</div>
                    <div className="text-lg font-medium">65</div>
                    <Badge variant="warning" className="mt-1">
                      MEDIUM
                    </Badge>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="text-xs text-muted-foreground">Change</div>
                    <div className="text-lg font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                      +40%
                    </div>
                    <Badge variant="outline" className="mt-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      INCREASING
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity vs Risk */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Activity vs Risk Correlation</CardTitle>
                <CardDescription>Correlation between transaction activity and risk score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", activity: 12, risk: 25 },
                        { month: "Feb", activity: 15, risk: 30 },
                        { month: "Mar", activity: 25, risk: 45 },
                        { month: "Apr", activity: 22, risk: 40 },
                        { month: "May", activity: 30, risk: 55 },
                        { month: "Jun", activity: 40, risk: 65 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 50]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="risk"
                        name="Risk Score"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="activity"
                        name="Transaction Count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="factors" className="space-y-4 mt-4">
            {/* Risk Factors Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Risk Factors Breakdown</CardTitle>
                <CardDescription>Detailed analysis of risk factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-red-500/10 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">High-Risk Connections</h3>
                        <p className="text-sm text-muted-foreground">Connected to 2 high-risk wallets</p>
                      </div>
                      <Badge className="ml-auto" variant="destructive">
                        20 pts
                      </Badge>
                    </div>
                    <Progress value={20} max={25} className="h-2" indicatorClassName="bg-red-500" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>Impact Score (max 25)</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-yellow-500/10 p-2 rounded-full">
                        <Activity className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Transaction Velocity</h3>
                        <p className="text-sm text-muted-foreground">
                          High number of transactions in a short time period
                        </p>
                      </div>
                      <Badge className="ml-auto" variant="warning">
                        15 pts
                      </Badge>
                    </div>
                    <Progress value={15} max={25} className="h-2" indicatorClassName="bg-yellow-500" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>Impact Score (max 25)</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-yellow-500/10 p-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Unusual Patterns</h3>
                        <p className="text-sm text-muted-foreground">Multiple transactions with unusual timing</p>
                      </div>
                      <Badge className="ml-auto" variant="warning">
                        15 pts
                      </Badge>
                    </div>
                    <Progress value={15} max={25} className="h-2" indicatorClassName="bg-yellow-500" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>Impact Score (max 25)</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-500/10 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Circular Transactions</h3>
                        <p className="text-sm text-muted-foreground">1 circular transaction pattern detected</p>
                      </div>
                      <Badge className="ml-auto" variant="outline">
                        10 pts
                      </Badge>
                    </div>
                    <Progress value={10} max={25} className="h-2" indicatorClassName="bg-blue-500" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>Impact Score (max 25)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
