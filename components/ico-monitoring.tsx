"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, Info } from "lucide-react"
import { MonitoringService } from "@/lib/monitoring-service"
import type { ICOProject } from "@/types/monitoring"
import { useRouter } from "next/navigation"

export function ICOMonitoring() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ICOProject[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "rugpull" | "successful">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadProjects() {
      setLoading(true)
      try {
        const data = await MonitoringService.getICOProjects(filter)
        setProjects(data)
      } catch (error) {
        console.error("Error loading ICO projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [filter])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline">Active</Badge>
      case "rugpull":
        return <Badge variant="destructive">Rug Pull</Badge>
      case "successful":
        return (
          <Badge variant="success" className="bg-green-500 hover:bg-green-600">
            Successful
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>X-ICO Monitoring</CardTitle>
        <CardDescription>Track and analyze ICOs promoted on social media platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="all" className="w-[400px]" onValueChange={(value) => setFilter(value as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="successful">Successful</TabsTrigger>
                <TabsTrigger value="rugpull">Rug Pulls</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, symbol, or address..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No ICO projects found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "There are no ICO projects matching the selected filter"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Launch Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.symbol}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {project.address.substring(0, 6)}...{project.address.substring(project.address.length - 4)}
                      </TableCell>
                      <TableCell>${(project.raisedAmount / 1000000).toFixed(2)}M</TableCell>
                      <TableCell>{new Date(project.launchDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(project.currentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              project.riskScore >= 70
                                ? "bg-red-500"
                                : project.riskScore >= 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          ></div>
                          {project.riskScore}/100
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/ico/${project.address}`)}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
