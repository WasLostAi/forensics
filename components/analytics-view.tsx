"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  Brain,
} from "lucide-react"

export function AnalyticsView() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    async function loadAnalyticsData() {
      setIsLoading(true)
      setError(null)
      try {
        // In a real implementation, this would fetch analytics data
        // For now, we'll just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setLastUpdated(new Date())
      } catch (err) {
        console.error("Failed to load analytics data:", err)
        setError("Failed to load analytics data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [timeRange])

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  // Mock data for charts
  const riskScoreData = [
    { date: "Jan", score: 25 },
    { date: "Feb", score: 30 },
    { date: "Mar", score: 45 },
    { date: "Apr", score: 40 },
    { date: "May", score: 55 },
    { date: "Jun", score: 65 },
    { date: "Jul", score: 60 },
    { date: "Aug", score: 70 },
    { date: "Sep", score: 75 },
    { date: "Oct", score: 68 },
    { date: "Nov", score: 72 },
    { date: "Dec", score: 80 },
  ]

  const transactionVolumeData = [
    { date: "Jan", volume: 120 },
    { date: "Feb", volume: 150 },
    { date: "Mar", volume: 200 },
    { date: "Apr", volume: 180 },
    { date: "May", volume: 250 },
    { date: "Jun", volume: 300 },
    { date: "Jul", volume: 280 },
    { date: "Aug", volume: 350 },
    { date: "Sep", volume: 400 },
    { date: "Oct", volume: 380 },
    { date: "Nov", volume: 420 },
    { date: "Dec", volume: 450 },
  ]

  const entityTypeData = [
    { name: "Exchange", value: 35 },
    { name: "Personal", value: 25 },
    { name: "Contract", value: 20 },
    { name: "Mixer", value: 10 },
    { name: "Unknown", value: 10 },
  ]

  const riskDistributionData = [
    { name: "High Risk", value: 15, color: "#ef4444" },
    { name: "Medium Risk", value: 30, color: "#f59e0b" },
    { name: "Low Risk", value: 55, color: "#10b981" },
  ]

  const anomalyDetectionData = [
    { date: "Week 1", detected: 5, baseline: 3 },
    { date: "Week 2", detected: 7, baseline: 3 },
    { date: "Week 3", detected: 4, baseline: 3 },
    { date: "Week 4", detected: 12, baseline: 3 },
    { date: "Week 5", detected: 8, baseline: 3 },
    { date: "Week 6", detected: 6, baseline: 3 },
    { date: "Week 7", detected: 15, baseline: 3 },
    { date: "Week 8", detected: 9, baseline: 3 },
  ]

  const walletActivityData = [
    { date: "Jan", active: 120, new: 45 },
    { date: "Feb", active: 140, new: 50 },
    { date: "Mar", active: 160, new: 60 },
    { date: "Apr", active: 180, new: 55 },
    { date: "May", active: 200, new: 70 },
    { date: "Jun", active: 220, new: 65 },
    { date: "Jul", active: 240, new: 80 },
    { date: "Aug", active: 260, new: 75 },
    { date: "Sep", active: 280, new: 90 },
    { date: "Oct", active: 300, new: 85 },
    { date: "Nov", active: 320, new: 95 },
    { date: "Dec", active: 340, new: 100 },
  ]

  const patternDetectionData = [
    { name: "Layering", count: 45 },
    { name: "Smurfing", count: 30 },
    { name: "Round-trip", count: 25 },
    { name: "Peeling Chain", count: 20 },
    { name: "Fan-out", count: 35 },
  ]

  const mlAccuracyData = [
    { date: "Jan", accuracy: 75 },
    { date: "Feb", accuracy: 78 },
    { date: "Mar", accuracy: 80 },
    { date: "Apr", accuracy: 82 },
    { date: "May", accuracy: 85 },
    { date: "Jun", accuracy: 84 },
    { date: "Jul", accuracy: 87 },
    { date: "Aug", accuracy: 89 },
    { date: "Sep", accuracy: 91 },
    { date: "Oct", accuracy: 92 },
    { date: "Nov", accuracy: 94 },
    { date: "Dec", accuracy: 95 },
  ]

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
            7D
          </Button>
          <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
            30D
          </Button>
          <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("90d")}>
            90D
          </Button>
          <Button variant={timeRange === "1y" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("1y")}>
            1Y
          </Button>
          <Button variant={timeRange === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("all")}>
            All
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transaction Patterns
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            ML Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Overview Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Wallets Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,245</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12.5% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transactions Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">458,932</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8.3% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">High Risk Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87</div>
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+23.4% from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Trend</CardTitle>
                <CardDescription>Average risk score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Number of transactions analyzed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={transactionVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="volume" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entity Type Distribution</CardTitle>
                <CardDescription>Breakdown of analyzed entities by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={entityTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {entityTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Breakdown of entities by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6 mt-6">
          {/* Risk Analysis Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">65.8</div>
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5.2 from last period</span>
                </div>
                <Progress value={65.8} max={100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">High Risk Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87</div>
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12 from last period</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">7% of total wallets</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Risk Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92.4%</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+1.8% from last period</span>
                </div>
                <Progress value={92.4} max={100} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
                <CardDescription>Number of wallets by risk score range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { range: "0-10", count: 120 },
                        { range: "11-20", count: 150 },
                        { range: "21-30", count: 180 },
                        { range: "31-40", count: 220 },
                        { range: "41-50", count: 170 },
                        { range: "51-60", count: 140 },
                        { range: "61-70", count: 110 },
                        { range: "71-80", count: 80 },
                        { range: "81-90", count: 50 },
                        { range: "91-100", count: 25 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Wallets" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors Impact</CardTitle>
                <CardDescription>Contribution of different factors to risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { factor: "Mixer Connections", impact: 25 },
                        { factor: "High-Risk Connections", impact: 20 },
                        { factor: "Anomaly Patterns", impact: 20 },
                        { factor: "Circular Patterns", impact: 15 },
                        { factor: "Transaction Velocity", impact: 15 },
                        { factor: "Unusual Amounts", impact: 10 },
                        { factor: "Unusual Timing", impact: 10 },
                        { factor: "New Wallet", impact: 5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="factor" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impact" name="Impact Score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>Weekly anomalies detected vs baseline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={anomalyDetectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="detected"
                      name="Anomalies Detected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#9ca3af" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 mt-6">
          {/* Transaction Patterns Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">458,932</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8.3% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Suspicious Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,245</div>
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+15.2% from last period</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">0.27% of total transactions</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pattern Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">94.8%</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+2.3% from last period</span>
                </div>
                <Progress value={94.8} max={100} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Activity</CardTitle>
                <CardDescription>Active and new wallets over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={walletActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="active" name="Active Wallets" fill="#8884d8" />
                      <Bar dataKey="new" name="New Wallets" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suspicious Pattern Types</CardTitle>
                <CardDescription>Breakdown of detected suspicious patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternDetectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Detections" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Network Metrics</CardTitle>
              <CardDescription>Key metrics about the transaction network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Network Density</h3>
                  <div className="text-2xl font-bold">0.023</div>
                  <p className="text-xs text-muted-foreground">Ratio of actual connections to possible connections</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Average Path Length</h3>
                  <div className="text-2xl font-bold">4.2</div>
                  <p className="text-xs text-muted-foreground">Average number of steps between any two wallets</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Clustering Coefficient</h3>
                  <div className="text-2xl font-bold">0.31</div>
                  <p className="text-xs text-muted-foreground">Measure of how wallets tend to cluster together</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ml" className="space-y-6 mt-6">
          {/* ML Insights Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">ML Model Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">95.2%</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+1.3% from last period</span>
                </div>
                <Progress value={95.2} max={100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">False Positive Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3.8%</div>
                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                  <TrendingDown className="h-4 w-4" />
                  <span>-0.7% from last period</span>
                </div>
                <Progress value={3.8} max={100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Model Training Iterations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <span>Last trained: 2 days ago</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ML Model Accuracy Trend</CardTitle>
              <CardDescription>Accuracy improvements over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mlAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      name="Model Accuracy (%)"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>Most important features for ML predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { feature: "Transaction Velocity", importance: 0.23 },
                        { feature: "Network Centrality", importance: 0.18 },
                        { feature: "Temporal Patterns", importance: 0.15 },
                        { feature: "Amount Distribution", importance: 0.12 },
                        { feature: "Entity Connections", importance: 0.1 },
                        { feature: "Wallet Age", importance: 0.08 },
                        { feature: "Transaction Size", importance: 0.07 },
                        { feature: "Circular Patterns", importance: 0.07 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 0.25]} />
                      <YAxis dataKey="feature" type="category" width={150} />
                      <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      <Legend />
                      <Bar dataKey="importance" name="Importance" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for ML models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Precision</h3>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <Progress value={94.2} max={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Recall</h3>
                      <span className="text-sm font-medium">92.8%</span>
                    </div>
                    <Progress value={92.8} max={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">F1 Score</h3>
                      <span className="text-sm font-medium">93.5%</span>
                    </div>
                    <Progress value={93.5} max={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">AUC-ROC</h3>
                      <span className="text-sm font-medium">96.7%</span>
                    </div>
                    <Progress value={96.7} max={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
