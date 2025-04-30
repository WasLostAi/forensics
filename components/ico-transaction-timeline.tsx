"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Zap,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  hash: string
  timestamp: string
  type: "in" | "out"
  amount: number
  from: string
  to: string
  fromLabel?: string
  toLabel?: string
  category?: "exchange" | "mixer" | "team" | "investor" | "unknown"
  significance?: "high" | "medium" | "low"
  note?: string
}

interface ICOTransactionTimelineProps {
  address: string
  className?: string
}

export function ICOTransactionTimeline({ address, className }: ICOTransactionTimelineProps) {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<"all" | "in" | "out">("all")
  const [minAmount, setMinAmount] = useState(0)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [significanceFilter, setSignificanceFilter] = useState<string>("all")

  useEffect(() => {
    // In a real implementation, this would fetch transaction data
    // For now, we'll use mock data with more transactions for a better timeline
    const mockTransactions: Transaction[] = [
      {
        hash: "5xGT7...Kj9p2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
        type: "in",
        amount: 1000000,
        from: "Investor1",
        to: address,
        fromLabel: "Lead Investor",
        category: "investor",
        significance: "high",
        note: "Initial seed funding",
      },
      {
        hash: "3rFD5...Lm7q9",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(), // 28 days ago
        type: "in",
        amount: 500000,
        from: "Investor2",
        to: address,
        fromLabel: "Angel Investor",
        category: "investor",
        significance: "medium",
      },
      {
        hash: "9pQR2...Zs4f7",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
        type: "out",
        amount: 200000,
        from: address,
        to: "TeamWallet1",
        toLabel: "Development Fund",
        category: "team",
        significance: "medium",
        note: "Allocation for development team",
      },
      {
        hash: "7kTH6...Wp2d4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
        type: "in",
        amount: 2000000,
        from: "Investor3",
        to: address,
        fromLabel: "Venture Capital",
        category: "investor",
        significance: "high",
        note: "Series A funding",
      },
      {
        hash: "2nVB6...Zx3f8",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
        type: "out",
        amount: 300000,
        from: address,
        to: "MarketingWallet",
        toLabel: "Marketing Fund",
        category: "team",
        significance: "medium",
      },
      {
        hash: "8pLM3...Rt5q7",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
        type: "out",
        amount: 500000,
        from: address,
        to: "ExchangeAddress1",
        toLabel: "Binance",
        category: "exchange",
        significance: "high",
        note: "Initial exchange listing fee",
      },
      {
        hash: "4jKL8...Hs9g2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
        type: "in",
        amount: 1500000,
        from: "PublicSale",
        to: address,
        fromLabel: "Public Sale",
        category: "investor",
        significance: "high",
        note: "Public token sale",
      },
      {
        hash: "6mNB7...Jk4h5",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
        type: "out",
        amount: 100000,
        from: address,
        to: "AirdropWallet",
        toLabel: "Community Airdrop",
        category: "team",
        significance: "low",
      },
      {
        hash: "1qWE9...Ty6u3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        type: "out",
        amount: 50000,
        from: address,
        to: "MixerAddress1",
        toLabel: "Tornado Cash Solana",
        category: "mixer",
        significance: "high",
        note: "Suspicious transfer to mixer",
      },
      {
        hash: "0oIU8...Pl2k7",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        type: "out",
        amount: 750000,
        from: address,
        to: "ExchangeAddress2",
        toLabel: "Kraken",
        category: "exchange",
        significance: "medium",
      },
      {
        hash: "5zXC7...Vb9n2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
        type: "out",
        amount: 25000,
        from: address,
        to: "UnknownWallet1",
        category: "unknown",
        significance: "low",
      },
    ]

    setTimeout(() => {
      setTransactions(mockTransactions)
      setFilteredTransactions(mockTransactions)
      setLoading(false)
    }, 1000)
  }, [address])

  useEffect(() => {
    let filtered = [...transactions]

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((tx) => tx.type === filter)
    }

    // Apply amount filter
    if (minAmount > 0) {
      filtered = filtered.filter((tx) => tx.amount >= minAmount)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((tx) => tx.category === categoryFilter)
    }

    // Apply significance filter
    if (significanceFilter !== "all") {
      filtered = filtered.filter((tx) => tx.significance === significanceFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredTransactions(filtered)
  }, [transactions, filter, minAmount, sortDirection, categoryFilter, significanceFilter])

  const getTransactionIcon = (tx: Transaction) => {
    if (tx.type === "in") {
      return <ArrowDownRight className="h-5 w-5 text-green-500" />
    } else {
      if (tx.category === "mixer") {
        return <Zap className="h-5 w-5 text-red-500" />
      }
      return <ArrowUpRight className="h-5 w-5 text-red-500" />
    }
  }

  const getTransactionColor = (tx: Transaction) => {
    if (tx.type === "in") {
      return "border-green-500/50 bg-green-500/10"
    } else {
      if (tx.category === "mixer") {
        return "border-red-500/50 bg-red-500/10"
      }
      if (tx.category === "exchange") {
        return "border-orange-500/50 bg-orange-500/10"
      }
      return "border-red-500/50 bg-red-500/10"
    }
  }

  const getSignificanceBadge = (significance?: string) => {
    switch (significance) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMaxAmount = () => {
    return Math.max(...transactions.map((tx) => tx.amount))
  }

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Transaction Timeline</CardTitle>
          <CardDescription>Loading transaction history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Transaction Timeline</CardTitle>
            <CardDescription>Chronological view of fund movements</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tabs
              defaultValue="all"
              className="w-auto"
              onValueChange={(value) => setFilter(value as "all" | "in" | "out")}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="in">Inflows</TabsTrigger>
                <TabsTrigger value="out">Outflows</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="exchange">Exchange</SelectItem>
                <SelectItem value="mixer">Mixer</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select value={significanceFilter} onValueChange={setSignificanceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Significance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              title={sortDirection === "asc" ? "Oldest first" : "Newest first"}
            >
              {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Min Amount: ${minAmount.toLocaleString()}</span>
          </div>
          <Slider
            defaultValue={[0]}
            max={getMaxAmount()}
            step={10000}
            onValueChange={(value) => setMinAmount(value[0])}
            className="w-full"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Timeline events */}
          <div className="space-y-8">
            {filteredTransactions.length === 0 ? (
              <div className="flex justify-center items-center py-12 text-muted-foreground">
                No transactions match your filters
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.hash} className="relative pl-14">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-4 top-1 w-5 h-5 rounded-full border-2 ${getTransactionColor(tx)} flex items-center justify-center -translate-x-1/2`}
                  >
                    {getTransactionIcon(tx)}
                  </div>

                  {/* Content */}
                  <div className={`p-4 rounded-lg border ${getTransactionColor(tx)}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDate(tx.timestamp)}</span>
                        {tx.significance && getSignificanceBadge(tx.significance)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm ${tx.type === "in" ? "text-green-500" : "text-red-500"}`}>
                          {tx.type === "in" ? "+" : "-"}${tx.amount.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                          <a href={`https://solscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">From</div>
                        <div className="font-medium">{tx.fromLabel || tx.from.substring(0, 8)}...</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">To</div>
                        <div className="font-medium">{tx.toLabel || tx.to.substring(0, 8)}...</div>
                      </div>
                    </div>

                    {tx.note && <div className="mt-2 text-sm border-t border-border pt-2">{tx.note}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
