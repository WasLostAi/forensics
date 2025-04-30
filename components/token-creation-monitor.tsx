"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Search, ExternalLink, Code, BarChart2, Shield } from "lucide-react"
import { shortenAddress } from "@/lib/utils"

// Mock data for demonstration
const newTokens = [
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "SuspectCoin",
    symbol: "SUS",
    creationTime: "2023-11-28T09:12:33Z",
    creator: "8xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
    riskScore: 92,
    riskLevel: "high",
    indicators: ["Creator linked to scams", "Suspicious contract code", "100% supply held by creator"],
    status: "monitoring",
  },
  {
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    name: "QuickGainToken",
    symbol: "QGT",
    creationTime: "2023-11-27T18:45:12Z",
    creator: "7Tz7NEHK9HRZrM8kSBzSZgc5wPJXQ2K5aSRe9LiGBx8VuiXQUEVmxHRVcnf1ySNJm6FSHhfYMvZ2tEJXU2c8YRWJ",
    riskScore: 85,
    riskLevel: "high",
    indicators: ["Unlimited minting", "No liquidity lock"],
    status: "monitoring",
  },
  {
    address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
    name: "NewProjectToken",
    symbol: "NPT",
    creationTime: "2023-11-26T14:23:45Z",
    creator: "6QBNMMbjmCFHuWGzVxdLcQXXw4PxW9ZWpWMfF2KgSZeWJKJX9UgJV1KV5kNvA9rLh9rVNFzL9XBFCvZjvLrQHbNj",
    riskScore: 65,
    riskLevel: "medium",
    indicators: ["New creator wallet", "Unusual supply distribution"],
    status: "monitoring",
  },
  {
    address: "RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr",
    name: "SafeFinanceToken",
    symbol: "SFT",
    creationTime: "2023-11-25T09:12:33Z",
    creator: "5KjQNXwTBLJH9qYLU7G5mdGQgMVp9jhvQ1D5XZtXRnKQT8sm3Yb4ZvYZ3z8ZQM1v9Fxv2jQKFJzVQZCzZvKjWRLN",
    riskScore: 42,
    riskLevel: "low",
    indicators: ["Standard token pattern"],
    status: "monitoring",
  },
  {
    address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    name: "LegitimateToken",
    symbol: "LGT",
    creationTime: "2023-11-24T18:45:12Z",
    creator: "4xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
    riskScore: 15,
    riskLevel: "low",
    indicators: ["Verified creator", "Locked liquidity"],
    status: "verified",
  },
]

export function TokenCreationMonitor() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter tokens based on search query
  const filteredTokens = newTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.creator.toLowerCase().includes(searchQuery.toLowerCase()),
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
                <p className="text-sm text-muted-foreground">High Risk Tokens</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk Tokens</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified Tokens</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by token name, symbol, or address..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/40 backdrop-blur-sm">
          <TabsTrigger value="all" className="font-genos">
            All Tokens
          </TabsTrigger>
          <TabsTrigger value="high-risk" className="font-genos">
            High Risk
          </TabsTrigger>
          <TabsTrigger value="medium-risk" className="font-genos">
            Medium Risk
          </TabsTrigger>
          <TabsTrigger value="verified" className="font-genos">
            Verified
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">New Token Monitoring</CardTitle>
              <CardDescription>Recently created tokens on Solana blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Creation Time</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Indicators</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No tokens matching your search criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTokens.map((token) => (
                        <TableRow key={token.address}>
                          <TableCell>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-muted-foreground">{token.symbol}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.address, 6)}</TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.creator, 6)}</TableCell>
                          <TableCell>{new Date(token.creationTime).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={getRiskBadgeVariant(token.riskLevel)}>{token.riskScore}</Badge>
                              <Progress
                                value={token.riskScore}
                                className="h-2 w-16"
                                indicatorClassName={
                                  token.riskScore > 80
                                    ? "bg-red-500"
                                    : token.riskScore > 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {token.indicators.map((indicator, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <a
                                  href={`https://explorer.solana.com/address/${token.address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">View on Explorer</span>
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Code className="h-4 w-4" />
                                <span className="sr-only">View Contract</span>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <BarChart2 className="h-4 w-4" />
                                <span className="sr-only">View Analytics</span>
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
              <CardTitle className="text-lg font-genos">High Risk Tokens</CardTitle>
              <CardDescription>Tokens with significant risk indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  {/* Similar table structure as above, filtered for high risk tokens */}
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Indicators</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens
                      .filter((t) => t.riskLevel === "high")
                      .map((token) => (
                        <TableRow key={token.address}>
                          <TableCell>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-muted-foreground">{token.symbol}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.address, 6)}</TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.creator, 6)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{token.riskScore}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {token.indicators.map((indicator, i) => (
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

        <TabsContent value="medium-risk">
          {/* Similar structure for medium risk tokens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">Medium Risk Tokens</CardTitle>
              <CardDescription>Tokens with moderate risk indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Indicators</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens
                      .filter((t) => t.riskLevel === "medium")
                      .map((token) => (
                        <TableRow key={token.address}>
                          <TableCell>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-muted-foreground">{token.symbol}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.address, 6)}</TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.creator, 6)}</TableCell>
                          <TableCell>
                            <Badge variant="warning">{token.riskScore}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {token.indicators.map((indicator, i) => (
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

        <TabsContent value="verified">
          {/* Similar structure for verified tokens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-genos">Verified Tokens</CardTitle>
              <CardDescription>Tokens with verified creators and low risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens
                      .filter((t) => t.status === "verified")
                      .map((token) => (
                        <TableRow key={token.address}>
                          <TableCell>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-muted-foreground">{token.symbol}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.address, 6)}</TableCell>
                          <TableCell className="font-mono text-xs">{shortenAddress(token.creator, 6)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              {token.riskScore}
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
