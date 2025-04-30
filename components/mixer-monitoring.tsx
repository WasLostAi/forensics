"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, Filter, Info } from "lucide-react"
import { MonitoringService } from "@/lib/monitoring-service"
import type { MixerData } from "@/types/monitoring"
import { useRouter } from "next/navigation"

export function MixerMonitoring() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mixers, setMixers] = useState<MixerData[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadMixers() {
      setLoading(true)
      try {
        const data = await MonitoringService.getMixerData()
        setMixers(data)
      } catch (error) {
        console.error("Error loading mixer data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMixers()
  }, [])

  const filteredMixers = mixers.filter(
    (mixer) =>
      mixer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mixer.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mixer.addresses.some((address) => address.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "protocol":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Protocol
          </Badge>
        )
      case "service":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Service
          </Badge>
        )
      case "exchange":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Exchange
          </Badge>
        )
      case "bridge":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            Bridge
          </Badge>
        )
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mixer Monitoring</CardTitle>
        <CardDescription>Track and analyze mixer services on Solana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{mixers.length} mixer services detected on Solana</span>
            </div>
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, type, or address..."
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
          ) : filteredMixers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No mixer services found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "Try adjusting your search query" : "There are no mixer services in the database"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Addresses</TableHead>
                    <TableHead>24h Volume</TableHead>
                    <TableHead>Total Volume</TableHead>
                    <TableHead>Active Users</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMixers.map((mixer) => (
                    <TableRow key={mixer.id}>
                      <TableCell className="font-medium">{mixer.name}</TableCell>
                      <TableCell>{getTypeBadge(mixer.type)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {mixer.addresses.length > 1
                          ? `${mixer.addresses.length} addresses`
                          : `${mixer.addresses[0].substring(0, 6)}...`}
                      </TableCell>
                      <TableCell>${(mixer.volume24h / 1000000).toFixed(2)}M</TableCell>
                      <TableCell>${(mixer.volumeTotal / 1000000).toFixed(2)}M</TableCell>
                      <TableCell>{mixer.activeUsers.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">
                        {mixer.patternSignature.hopCount} hops, {mixer.patternSignature.timePattern}/
                        {mixer.patternSignature.amountPattern}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              mixer.riskScore >= 70
                                ? "bg-red-500"
                                : mixer.riskScore >= 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          ></div>
                          {mixer.riskScore}/100
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/mixer/${mixer.id}`)}>
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
