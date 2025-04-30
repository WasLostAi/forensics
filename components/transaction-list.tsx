"use client"

import { useState, useEffect, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, ArrowUpDown, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import { getTransactionHistory } from "@/lib/solana"
import { formatSol, formatDate, shortenAddress } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"
import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRef } from "react"

interface TransactionListProps {
  walletAddress: string
}

export function TransactionList({ walletAddress }: TransactionListProps) {
  const { rpcUrl } = useSettings()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Fetch transactions with pagination
  useEffect(() => {
    async function loadTransactions() {
      if (!walletAddress) return

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Fetching transactions for wallet: ${walletAddress}, page: ${page}`)
        const data = await getTransactionHistory(walletAddress, 50, rpcUrl, page)

        // If it's the first page, replace transactions, otherwise append
        if (page === 1) {
          setTransactions(data)
        } else {
          setTransactions((prev) => [...prev, ...data])
        }
      } catch (err) {
        console.error("Failed to load transactions:", err)
        setError(`Failed to fetch transaction data: ${err instanceof Error ? err.message : String(err)}`)
        if (page === 1) {
          setTransactions([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [walletAddress, page, rpcUrl])

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
  }

  // Apply filters and sorting
  const filteredAndSortedTransactions = useMemo(() => {
    // First apply search filter
    let result = transactions.filter(
      (tx) =>
        tx.signature.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.destination.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Then apply type filter
    if (filterType) {
      if (filterType === "incoming") {
        result = result.filter((tx) => tx.destination === walletAddress)
      } else if (filterType === "outgoing") {
        result = result.filter((tx) => tx.source === walletAddress)
      } else if (filterType === "swaps") {
        result = result.filter((tx) => tx.type === "swap")
      }
    }

    // Then apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (sortConfig.key === "amount") {
          return sortConfig.direction === "asc" ? a.amount - b.amount : b.amount - a.amount
        }

        if (sortConfig.key === "date") {
          const dateA = new Date(a.blockTime).getTime()
          const dateB = new Date(b.blockTime).getTime()
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
        }

        return 0
      })
    }

    return result
  }, [transactions, searchQuery, filterType, sortConfig, walletAddress])

  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedTransactions.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56, // Approximate row height
    overscan: 10,
  })

  // Load more transactions when scrolling to the bottom
  const handleScroll = () => {
    if (!tableContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current

    // If scrolled to bottom and not currently loading, load more
    if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by signature, source, or destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : "All Transactions"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterType(null)}>All Transactions</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("incoming")}>Incoming Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("outgoing")}>Outgoing Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("swaps")}>Swaps Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm"
        ref={tableContainerRef}
        onScroll={handleScroll}
        style={{ height: "600px", overflow: "auto" }}
      >
        <Table>
          <TableHeader className="bg-secondary/20 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead onClick={() => requestSort("amount")} className="cursor-pointer">
                <div className="flex items-center">
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead onClick={() => requestSort("date")} className="cursor-pointer">
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {error ? "Error loading transactions" : "No transactions found."}
                </TableCell>
              </TableRow>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const tx = filteredAndSortedTransactions[virtualRow.index]
                  return (
                    <TableRow
                      key={tx.signature}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TableCell>
                        <Badge variant={tx.type === "transfer" ? "outline" : "secondary"}>{tx.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.signature.substring(0, 8)}...{tx.signature.substring(tx.signature.length - 8)}
                      </TableCell>
                      <TableCell className={tx.source === walletAddress ? "text-red-500" : "text-green-500"}>
                        {tx.source === walletAddress ? "-" : "+"}
                        {formatSol(tx.amount)} SOL
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.source === walletAddress ? "This Wallet" : `${shortenAddress(tx.source, 4)}`}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.destination === walletAddress ? "This Wallet" : `${shortenAddress(tx.destination, 4)}`}
                      </TableCell>
                      <TableCell>{formatDate(tx.blockTime)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`https://explorer.solana.com/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on Solana Explorer</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </div>
            )}
          </TableBody>
        </Table>
      </div>

      {isLoading && filteredAndSortedTransactions.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading more transactions...</span>
        </div>
      )}
    </div>
  )
}
