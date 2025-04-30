"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, Zap, Info } from "lucide-react"
import { MonitoringService } from "@/lib/monitoring-service"
import type { SniperData } from "@/types/monitoring"
import { useRouter } from "next/navigation"

export function SniperMonitoring() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [snipers, setSnipers] = useState<SniperData[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadSnipers() {
      setLoading(true)
      try {
        const data = await MonitoringService.getSniperData()
        setSnipers(data)
      } catch (error) {
        console.error("Error loading sniper data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSnipers()
  }, [])

  const filteredSnipers = snipers.filter(
    (sniper) =>
      sniper.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sniper.label && sniper.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sniper.mevType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getMEVTypeBadge = (type: string) => {
    switch (type) {
      case "frontrun":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Front Run
          </Badge>
        )
      case "backrun":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Back Run
          </Badge>
        )
      case "sandwich":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Sandwich
          </Badge>
        )
      case "arbitrage":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Arbitrage
          </Badge>
        )
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sniper Bot Monitoring</CardTitle>
        <CardDescription>Track and analyze MEV bots and snipers on Solana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">{snipers.length} active sniper bots detected on Solana</span>
            </div>
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address, label, or type..."
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
          ) : filteredSnipers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sniper bots found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "Try adjusting your search query" : "There are no sniper bots in the database"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address/Label</TableHead>
                    <TableHead>Target Platforms</TableHead>
                    <TableHead>Total Profit</TableHead>
                    <TableHead>24h Profit</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>MEV Type</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSnipers.map((sniper) => (
                    <TableRow key={sniper.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-mono text-xs">
                            {sniper.address.substring(0, 6)}...{sniper.address.substring(sniper.address.length - 4)}
                          </div>
                          {sniper.label && <div className="text-xs text-muted-foreground">{sniper.label}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{sniper.targetPlatforms.join(", ")}</TableCell>
                      <TableCell>${sniper.profitTotal.toLocaleString()}</TableCell>
                      <TableCell>${sniper.profit24h.toLocaleString()}</TableCell>
                      <TableCell>{sniper.transactionCount.toLocaleString()}</TableCell>
                      <TableCell>{(sniper.successRate * 100).toFixed(1)}%</TableCell>
                      <TableCell>{getMEVTypeBadge(sniper.mevType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              sniper.riskScore >= 70
                                ? "bg-red-500"
                                : sniper.riskScore >= 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          ></div>
                          {sniper.riskScore}/100
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/sniper/${sniper.id}`)}>
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
