"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, BarChart3, PieChart } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getEntityLabelStats } from "@/lib/entity-service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"

export function EntityStatistics() {
  const [stats, setStats] = useState<{
    total: number
    byCategory: Record<string, number>
    bySource: Record<string, number>
    verified: number
    clustered: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getEntityLabelStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to load entity statistics:", error)
        setError("Failed to load entity statistics. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const categoryData = stats ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value })) : []
  const sourceData = stats ? Object.entries(stats.bySource).map(([name, value]) => ({ name, value })) : []
  const verificationData = stats
    ? [
        { name: "Verified", value: stats.verified },
        { name: "Unverified", value: stats.total - stats.verified },
      ]
    : []
  const clusterData = stats
    ? [
        { name: "In Clusters", value: stats.clustered },
        { name: "Not Clustered", value: stats.total - stats.clustered },
      ]
    : []

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats?.total || 0}</CardTitle>
            <CardDescription>Total Entities</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats?.verified || 0}</CardTitle>
            <CardDescription>Verified Entities</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {isLoading ? "..." : Object.keys(stats?.byCategory || {}).length || 0}
            </CardTitle>
            <CardDescription>Categories</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats?.clustered || 0}</CardTitle>
            <CardDescription>Clustered Entities</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="category" className="space-y-4">
        <TabsList>
          <TabsTrigger value="category">
            <BarChart3 className="mr-2 h-4 w-4" />
            By Category
          </TabsTrigger>
          <TabsTrigger value="source">
            <BarChart3 className="mr-2 h-4 w-4" />
            By Source
          </TabsTrigger>
          <TabsTrigger value="verification">
            <PieChart className="mr-2 h-4 w-4" />
            By Verification
          </TabsTrigger>
          <TabsTrigger value="clustering">
            <PieChart className="mr-2 h-4 w-4" />
            By Clustering
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Entities by Category</CardTitle>
              <CardDescription>Distribution of entities across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">Loading statistics...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>Entities by Source</CardTitle>
              <CardDescription>Distribution of entities by their source of information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">Loading statistics...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Entities by Verification Status</CardTitle>
              <CardDescription>Distribution of verified vs. unverified entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">Loading statistics...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={verificationData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {verificationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clustering">
          <Card>
            <CardHeader>
              <CardTitle>Entities by Clustering Status</CardTitle>
              <CardDescription>Distribution of entities in clusters vs. unclustered entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">Loading statistics...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={clusterData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {clusterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
