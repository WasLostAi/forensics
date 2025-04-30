"use client"

import { useEffect, useState } from "react"
import { BarChart, PieChart, Activity, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { EntityLabel } from "@/types/entity"

interface EntityLabelStatisticsProps {
  walletAddress?: string
}

export function EntityLabelStatistics({ walletAddress }: EntityLabelStatisticsProps) {
  const [activeTab, setActiveTab] = useState("categories")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalLabels: number
    categoryCounts: Record<string, number>
    sourceCounts: Record<string, number>
    riskDistribution: Record<string, number>
    recentActivity: { date: string; count: number }[]
    topTags: { tag: string; count: number }[]
  }>({
    totalLabels: 0,
    categoryCounts: {},
    sourceCounts: {},
    riskDistribution: {},
    recentActivity: [],
    topTags: [],
  })

  useEffect(() => {
    loadStatistics()
  }, [walletAddress])

  async function loadStatistics() {
    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, you would fetch statistics from the database
      // For now, we'll use mock data

      // Mock data
      const mockLabels: EntityLabel[] = [
        {
          id: "1",
          address: "DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z",
          label: "Binance Hot Wallet",
          category: "exchange",
          confidence: 0.95,
          source: "community",
          createdAt: "2023-05-15T14:23:45Z",
          updatedAt: "2023-05-15T14:23:45Z",
          verified: true,
          riskScore: 10,
        },
        {
          id: "2",
          address: "5xoBq7f7CDgZwqHrDBdRWM84ExRetg4gZq93dyJtoSwp",
          label: "High Volume Trader",
          category: "individual",
          confidence: 0.75,
          source: "algorithm",
          createdAt: "2023-06-22T09:12:33Z",
          updatedAt: "2023-06-22T09:12:33Z",
          riskScore: 35,
        },
        {
          id: "3",
          address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
          label: "Suspicious Mixer",
          category: "mixer",
          confidence: 0.88,
          source: "user",
          createdAt: "2023-07-10T16:45:12Z",
          updatedAt: "2023-07-10T16:45:12Z",
          riskScore: 85,
          tags: ["high-risk", "mixer"],
        },
        {
          id: "4",
          address: "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5",
          label: "Solana Foundation",
          category: "contract",
          confidence: 1.0,
          source: "database",
          createdAt: "2023-04-05T10:30:22Z",
          updatedAt: "2023-04-05T10:30:22Z",
          verified: true,
          riskScore: 5,
          tags: ["verified", "foundation"],
        },
        {
          id: "5",
          address: "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR",
          label: "Phishing Contract",
          category: "scam",
          confidence: 0.92,
          source: "community",
          createdAt: "2023-08-18T21:15:40Z",
          updatedAt: "2023-08-18T21:15:40Z",
          riskScore: 95,
          tags: ["phishing", "scam", "high-risk"],
        },
      ]

      // Calculate statistics
      const categoryCounts: Record<string, number> = {}
      const sourceCounts: Record<string, number> = {}
      const riskDistribution: Record<string, number> = {
        "Low (0-30)": 0,
        "Medium (31-70)": 0,
        "High (71-100)": 0,
      }
      const tagCounts: Record<string, number> = {}

      mockLabels.forEach((label) => {
        // Category counts
        categoryCounts[label.category] = (categoryCounts[label.category] || 0) + 1

        // Source counts
        sourceCounts[label.source] = (sourceCounts[label.source] || 0) + 1

        // Risk distribution
        if (label.riskScore !== undefined) {
          if (label.riskScore <= 30) {
            riskDistribution["Low (0-30)"]++
          } else if (label.riskScore <= 70) {
            riskDistribution["Medium (31-70)"]++
          } else {
            riskDistribution["High (71-100)"]++
          }
        }

        // Tag counts
        if (label.tags) {
          label.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      // Generate recent activity (last 7 days)
      const recentActivity = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split("T")[0]

        // Random count between 0 and 5 for mock data
        const count = Math.floor(Math.random() * 6)

        recentActivity.push({ date: dateString, count })
      }

      // Get top 5 tags
      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        totalLabels: mockLabels.length,
        categoryCounts,
        sourceCounts,
        riskDistribution,
        recentActivity,
        topTags,
      })
    } catch (err) {
      console.error("Failed to load statistics:", err)
      setError("Failed to load statistics. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderBarChart = (data: Record<string, number>, title: string) => {
    const maxValue = Math.max(...Object.values(data))

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{key}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(value / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Label Statistics</CardTitle>
        <CardDescription>Overview and analytics of your entity labels</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>Loading statistics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalLabels}</div>
                    <p className="text-xs text-muted-foreground">Total Labels</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</div>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.topTags.length}</div>
                    <p className="text-xs text-muted-foreground">Unique Tags</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="categories">
                  <PieChart className="mr-2 h-4 w-4" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="sources">
                  <BarChart className="mr-2 h-4 w-4" />
                  Sources
                </TabsTrigger>
                <TabsTrigger value="risk">
                  <Activity className="mr-2 h-4 w-4" />
                  Risk Levels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="mt-4 space-y-4">
                {renderBarChart(stats.categoryCounts, "Distribution by Category")}

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.topTags.map(({ tag, count }) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">{count}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="mt-4">
                {renderBarChart(stats.sourceCounts, "Distribution by Source")}

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                  <div className="space-y-2">
                    {stats.recentActivity.map(({ date, count }) => (
                      <div key={date} className="flex items-center justify-between text-sm">
                        <span>{date}</span>
                        <div className="flex items-center">
                          <span className="mr-2">{count} labels</span>
                          <div className="flex">
                            {Array.from({ length: count }).map((_, i) => (
                              <div key={i} className="h-3 w-3 bg-primary rounded-sm ml-0.5" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="mt-4">
                {renderBarChart(stats.riskDistribution, "Risk Level Distribution")}

                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <h3 className="text-sm font-medium mb-2">Risk Level Explanation</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                      <span>Low (0-30): Generally safe entities with minimal risk</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                      <span>Medium (31-70): Exercise caution when interacting</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                      <span>High (71-100): High-risk entities, potential scams or mixers</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
