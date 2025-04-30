"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ICOProject } from "@/types/monitoring"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ICOFundFlowProps {
  project: ICOProject
}

export function ICOFundFlow({ project }: ICOFundFlowProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!project.fundFlow) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-medium">No fund flow data available</h3>
        <p className="text-muted-foreground mt-2">Fund flow data is not available for this project</p>
      </div>
    )
  }

  const { fundFlow } = project

  const outflowData = [
    { name: "Exchanges", value: fundFlow.outflows.exchanges },
    { name: "Mixers", value: fundFlow.outflows.mixers },
    { name: "Other", value: fundFlow.outflows.other },
    { name: "Unknown", value: fundFlow.outflows.unknown },
  ].filter((item) => item.value > 0)

  const balanceData = [
    { name: "Current Balance", value: fundFlow.currentBalance },
    { name: "Outflows", value: fundFlow.initialRaise - fundFlow.currentBalance },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "exchange":
        return <Badge variant="outline">Exchange</Badge>
      case "mixer":
        return <Badge variant="destructive">Mixer</Badge>
      case "project":
        return <Badge variant="secondary">Project</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fund Distribution</CardTitle>
            <CardDescription>How raised funds have been distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  exchanges: {
                    label: "Exchanges",
                    color: "hsl(var(--chart-1))",
                  },
                  mixers: {
                    label: "Mixers",
                    color: "hsl(var(--chart-2))",
                  },
                  other: {
                    label: "Other",
                    color: "hsl(var(--chart-3))",
                  },
                  unknown: {
                    label: "Unknown",
                    color: "hsl(var(--chart-4))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outflowData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {outflowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funds Remaining</CardTitle>
            <CardDescription>Current balance vs. total outflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Amount (USD)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={balanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Destinations</CardTitle>
          <CardDescription>Where the funds have been sent</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundFlow.topDestinations.map((destination, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{destination.address}</TableCell>
                  <TableCell>{destination.label || "Unknown"}</TableCell>
                  <TableCell>{getCategoryBadge(destination.category)}</TableCell>
                  <TableCell className="text-right">${destination.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
