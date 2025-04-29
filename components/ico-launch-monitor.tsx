"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Search, ExternalLink, Twitter, BarChart2, Shield, Users } from "lucide-react"
import { shortenAddress } from "@/lib/utils"

// Mock data for demonstration
const icoLaunches = [
  {
    id: "1",
    name: "SuspectCoin ICO",
    symbol: "SUS",
    launchDate: "2023-11-28T09:12:33Z",
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    creatorAddress: "8xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
    twitterHandle: "@SuspectCoin",
    twitterFollowers: 12500,
    botPercentage: 85,
    riskScore: 92,
    riskLevel: "high",
    indicators: ["Bot activity", "Anonymous team", "Unrealistic promises"],
    status: "monitoring",
  },
  {
    id: "2",
    name: "QuickGain ICO",
    symbol: "QGT",
    launchDate: "2023-11-27T18:45:12Z",
    tokenAddress: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    creatorAddress: "7Tz7NEHK9HRZrM8kSBzSZgc5wPJXQ2K5aSRe9LiGBx8VuiXQUEVmxHRVcnf1ySNJm6FSHhfYMvZ2tEJXU2c8YRWJ",
    twitterHandle: "@QuickGainToken",
    twitterFollowers: 8700,
    botPercentage: 72,
    riskScore: 85,
    riskLevel: "high",
    indicators: ["Suspicious promotion pattern", "Paid influencers"],
    status: "monitoring",
  },
  {
    id: "3",
    name: "NewProject ICO",
    symbol: "NPT",
    launchDate: "2023-11-26T14:23:45Z",
    tokenAddress: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
    creatorAddress: "6QBNMMbjmCFHuWGzVxdLcQXXw4PxW9ZWpWMfF2KgSZeWJKJX9UgJV1KV5kNvA9rLh9rVNFzL9XBFCvZjvLrQHbNj",
    twitterHandle: "@NewProjectToken",
    twitterFollowers: 5200,
    botPercentage: 45,
    riskScore: 65,
    riskLevel: "medium",
    indicators: ["New team", "Limited roadmap"],
    status: "monitoring",
  },
  {
    id: "4",
    name: "SafeFinance ICO",
    symbol: "SFT",
    launchDate: "2023-11-25T09:12:33Z",
    tokenAddress: "RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr",
    creatorAddress: "5KjQNXwTBLJH9qYLU7G5mdGQgMVp9jhvQ1D5XZtXRnKQT8sm3Yb4ZvYZ3z8ZQM1v9Fxv2jQKFJzVQZCzZvKjWRLN",
    twitterHandle: "@SafeFinanceToken",
    twitterFollowers: 3800,
    botPercentage: 20,
    riskScore: 42,
    riskLevel: "low",
    indicators: ["Transparent team"],
    status: "monitoring",
  },
  {
    id: "5",
    name: "Legitimate ICO",
    symbol: "LGT",
    launchDate: "2023-11-24T18:45:12Z",
    tokenAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    creatorAddress: "4xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
    twitterHandle: "@LegitimateToken",
    twitterFollowers: 15000,
    botPercentage: 5,
    riskScore: 15,
    riskLevel: "low",
    indicators: ["KYC verified team", "Audited contract"],
    status: "verified",
  },
]

export function IcoLaunchMonitor() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter ICOs based on search query
  const filteredIcos = icoLaunches.filter(
    (ico) =>
      ico.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ico.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ico.twitterHandle.toLowerCase().includes(searchQuery.toLowerCase()),
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk ICOs</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Twitter className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ICOs Tracked on X</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified ICOs</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ICO name, symbol, or Twitter handle..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/40 backdrop-blur-sm">
          <TabsTrigger value="all" className="font-genos">
            All ICOs
          </TabsTrigger>
          <TabsTrigger value="high-risk" className="font-genos">
            High Risk
          </TabsTrigger>
          <TabsTrigger value="social" className="font-genos">
            Social Analysis
          </TabsTrigger>
          <TabsTrigger value="verified" className="font-genos">
            Verified
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">ICO Launch Monitoring</CardTitle>
              <CardDescription>Tracking ICO launches on X (Twitter)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>ICO</TableHead>
                      <TableHead>Twitter</TableHead>
                      <TableHead>Launch Date</TableHead>
                      <TableHead>Token Address</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Bot Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIcos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No ICOs matching your search criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIcos.map((ico) => (
                        <TableRow key={ico.id}>
                          <TableCell>
                            <div className="font-medium">{ico.name}</div>
                            <div className="text-xs text-muted-foreground">{ico.symbol}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-blue-500" />
                              <span>{ico.twitterHandle}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {ico.twitterFollowers.toLocaleString()} followers
                            </div>
                          </TableCell>
                          <TableCell>{new Date(ico.launchDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(ico.tokenAddress, 6)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={getRiskBadgeVariant(ico.riskLevel)}>{ico.riskScore}</Badge>
                              <Progress
                                value={ico.riskScore}
                                className="h-2 w-16"
                                indicatorClassName={
                                  ico.riskScore > 80
                                    ? "bg-red-500"
                                    : ico.riskScore > 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{ico.botPercentage}%</span>
                              <Progress
                                value={ico.botPercentage}
                                className="h-2 w-16"
                                indicatorClassName={
                                  ico.botPercentage > 70
                                    ? "bg-red-500"
                                    : ico.botPercentage > 40
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <a
                                  href={`https://twitter.com/${ico.twitterHandle.substring(1)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">View on Twitter</span>
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <BarChart2 className="h-4 w-4" />
                                <span className="sr-only">Social Analysis</span>
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
        </TabsContent>

        <TabsContent value="high-risk">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">High Risk ICOs</CardTitle>
              <CardDescription>ICOs with significant risk indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>ICO</TableHead>
                      <TableHead>Twitter</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Indicators</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIcos
                      .filter((ico) => ico.riskLevel === "high")
                      .map((ico) => (
                        <TableRow key={ico.id}>
                          <TableCell>
                            <div className="font-medium">{ico.name}</div>
                            <div className="text-xs text-muted-foreground">{ico.symbol}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-blue-500" />
                              <span>{ico.twitterHandle}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{ico.riskScore}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {ico.indicators.map((indicator, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">Social Media Analysis</CardTitle>
              <CardDescription>Analysis of ICO social media presence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Social media analysis visualization will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">Verified ICOs</CardTitle>
              <CardDescription>ICOs with verified teams and low risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>ICO</TableHead>
                      <TableHead>Twitter</TableHead>
                      <TableHead>Launch Date</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIcos
                      .filter((ico) => ico.status === "verified")
                      .map((ico) => (
                        <TableRow key={ico.id}>
                          <TableCell>
                            <div className="font-medium">{ico.name}</div>
                            <div className="text-xs text-muted-foreground">{ico.symbol}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-blue-500" />
                              <span>{ico.twitterHandle}</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(ico.launchDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              {ico.riskScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
