"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, AlertTriangle, Info } from "lucide-react"
import { MonitoringService } from "@/lib/monitoring-service"
import type { RugPullData } from "@/types/monitoring"
import { useRouter } from "next/navigation"

export function RugPullMonitoring() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rugPulls, setRugPulls] = useState<RugPullData[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadRugPulls() {
      setLoading(true)
      try {
        const data = await MonitoringService.getRugPullData()
        setRugPulls(data)
      } catch (error) {
        console.error("Error loading rug pull data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRugPulls()
  }, [])

  const filteredRugPulls = rugPulls.filter(
    (rugPull) =>
      rugPull.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rugPull.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rugPull.deployer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getPatternBadge = (pattern: string) => {
    switch (pattern) {
      case "fast_rug":
        return <Badge variant="destructive">Fast Rug</Badge>
      case "slow_rug":
        return <Badge variant="warning">Slow Rug</Badge>
      case "honeypot":
        return <Badge variant="destructive">Honeypot</Badge>
      case "back_run":
        return <Badge variant="warning">Back Run</Badge>
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rug Pull Monitoring</CardTitle>
        <CardDescription>Track and analyze rug pulls on Solana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium">{rugPulls.length} rug pulls detected in the last 30 days</span>
            </div>
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by token, symbol, or deployer..."
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
          ) : filteredRugPulls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No rug pulls found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "Try adjusting your search query" : "There are no rug pulls in the database"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Deployer</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Initial Liquidity</TableHead>
                    <TableHead>Victims</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRugPulls.map((rugPull) => (
                    <TableRow key={rugPull.id}>
                      <TableCell className="font-medium">{rugPull.tokenName}</TableCell>
                      <TableCell>{rugPull.tokenSymbol}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {rugPull.deployer.substring(0, 6)}...
                        {rugPull.deployerLabel && (
                          <Badge variant="outline" className="ml-2">
                            {rugPull.deployerLabel}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{rugPull.platform}</TableCell>
                      <TableCell>${rugPull.initialLiquidity.toLocaleString()}</TableCell>
                      <TableCell>{rugPull.victimCount.toLocaleString()}</TableCell>
                      <TableCell>{getPatternBadge(rugPull.pattern)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              rugPull.riskScore >= 70
                                ? "bg-red-500"
                                : rugPull.riskScore >= 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          ></div>
                          {rugPull.riskScore}/100
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/rugpull/${rugPull.id}`)}>
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
