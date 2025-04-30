"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertTriangle, ChevronDown, Filter, Search, Shield, Eye, BarChart2 } from "lucide-react"
import { shortenAddress } from "@/lib/utils"

// Mock data for demonstration
const suspiciousWallets = [
  {
    address: "8xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
    creationTime: "2023-11-28T09:12:33Z",
    riskScore: 92,
    riskLevel: "high",
    indicators: ["Mixer connection", "Suspicious funding", "Abnormal transaction pattern"],
    status: "monitoring",
  },
  {
    address: "7Tz7NEHK9HRZrM8kSBzSZgc5wPJXQ2K5aSRe9LiGBx8VuiXQUEVmxHRVcnf1ySNJm6FSHhfYMvZ2tEJXU2c8YRWJ",
    creationTime: "2023-11-27T18:45:12Z",
    riskScore: 87,
    riskLevel: "high",
    indicators: ["Connected to known scam", "Rapid fund movement"],
    status: "monitoring",
  },
  {
    address: "6QBNMMbjmCFHuWGzVxdLcQXXw4PxW9ZWpWMfF2KgSZeWJKJX9UgJV1KV5kNvA9rLh9rVNFzL9XBFCvZjvLrQHbNj",
    creationTime: "2023-11-26T14:23:45Z",
    riskScore: 75,
    riskLevel: "medium",
    indicators: ["Unusual creation pattern", "Connected to high-risk wallet"],
    status: "monitoring",
  },
  {
    address: "5KjQNXwTBLJH9qYLU7G5mdGQgMVp9jhvQ1D5XZtXRnKQT8sm3Yb4ZvYZ3z8ZQM1v9Fxv2jQKFJzVQZCzZvKjWRLN",
    creationTime: "2023-11-25T09:12:33Z",
    riskScore: 68,
    riskLevel: "medium",
    indicators: ["Suspicious funding source"],
    status: "monitoring",
  },
  {
    address: "4xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
    creationTime: "2023-11-24T18:45:12Z",
    riskScore: 45,
    riskLevel: "low",
    indicators: ["New wallet pattern"],
    status: "monitoring",
  },
]

export function MaliciousWalletMonitor() {
  const [minRiskScore, setMinRiskScore] = useState(50)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter wallets based on search query and risk score
  const filteredWallets = suspiciousWallets.filter(
    (wallet) =>
      wallet.riskScore >= minRiskScore &&
      (searchQuery === "" ||
        wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.indicators.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-500/10 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Risk Wallets</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address or risk indicator..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="p-4">
                <p className="text-sm font-medium mb-2">Minimum Risk Score</p>
                <Slider
                  value={[minRiskScore]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setMinRiskScore(value[0])}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>{minRiskScore}</span>
                  <span>High</span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-genos">Suspicious Wallet Monitoring</CardTitle>
          <CardDescription>Newly created wallets with suspicious characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                <TableRow>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Creation Time</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Indicators</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No suspicious wallets matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWallets.map((wallet) => (
                    <TableRow key={wallet.address}>
                      <TableCell className="font-mono text-xs">{shortenAddress(wallet.address, 8)}</TableCell>
                      <TableCell>{new Date(wallet.creationTime).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRiskBadgeVariant(wallet.riskLevel)}>{wallet.riskScore}</Badge>
                          <div
                            className="h-2 flex-1 bg-secondary rounded-full overflow-hidden"
                            style={{ maxWidth: "100px" }}
                          >
                            <div
                              className={`h-full ${
                                wallet.riskScore > 80
                                  ? "bg-red-500"
                                  : wallet.riskScore > 60
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${wallet.riskScore}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {wallet.indicators.map((indicator, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                          {wallet.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/wallet/${wallet.address}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <BarChart2 className="h-4 w-4" />
                            <span className="sr-only">View Analytics</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Shield className="h-4 w-4" />
                            <span className="sr-only">Monitor</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-genos">Wallet Creation Patterns</CardTitle>
          <CardDescription>Temporal analysis of suspicious wallet creation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-md">
            <p className="text-muted-foreground">Wallet creation pattern visualization will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
