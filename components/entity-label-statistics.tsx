"use client"

import { useMemo } from "react"
import type { EntityLabel } from "@/types/entity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, PieChart, ShieldAlert, Shield, HelpCircle } from "lucide-react"

// Chart components for visualization
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface EntityLabelStatisticsProps {
  labels: EntityLabel[]
}

export function EntityLabelStatistics({ labels }: EntityLabelStatisticsProps) {
  const categoryStats = useMemo(() => {
    const categories: Record<string, number> = {}

    labels.forEach((label) => {
      if (label.category) {
        categories[label.category] = (categories[label.category] || 0) + 1
      }
    })

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [labels])

  const riskStats = useMemo(() => {
    const riskLevels = {
      "Low (0-25)": 0,
      "Medium (26-50)": 0,
      "High (51-75)": 0,
      "Critical (76-100)": 0,
    }

    labels.forEach((label) => {
      const score = label.riskScore || 0
      if (score <= 25) riskLevels["Low (0-25)"]++
      else if (score <= 50) riskLevels["Medium (26-50)"]++
      else if (score <= 75) riskLevels["High (51-75)"]++
      else riskLevels["Critical (76-100)"]++
    })

    return Object.entries(riskLevels).map(([name, value]) => ({ name, value }))
  }, [labels])

  const verificationStats = useMemo(() => {
    const verified = labels.filter((label) => label.verified).length
    const unverified = labels.length - verified

    return [
      { name: "Verified", value: verified },
      { name: "Unverified", value: unverified },
    ]
  }, [labels])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FCCDE5", "#D0ED57"]
  const RISK_COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#FF0000"]
  const VERIFICATION_COLORS = ["#00C49F", "#8884D8"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5" />
          <span>Entity Label Statistics</span>
        </CardTitle>
        <CardDescription>Analytics and statistics about your entity labels</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">
              <PieChart className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="risk">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Risk Distribution
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-2" />
              Verification Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="h-80">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} labels`, "Count"]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <HelpCircle className="h-5 w-5 mr-2" />
                No category data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk" className="h-80">
            {labels.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} labels`, "Count"]} />
                  <Legend />
                  <Bar dataKey="value" name="Risk Distribution">
                    {riskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <HelpCircle className="h-5 w-5 mr-2" />
                No risk score data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="verification" className="h-80">
            {labels.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={verificationStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {verificationStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={VERIFICATION_COLORS[index % VERIFICATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} labels`, "Count"]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <HelpCircle className="h-5 w-5 mr-2" />
                No verification data available
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{labels.length}</div>
              <div className="text-sm text-muted-foreground">Total Labels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{categoryStats.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{verificationStats[0].value}</div>
              <div className="text-sm text-muted-foreground">Verified Entities</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
