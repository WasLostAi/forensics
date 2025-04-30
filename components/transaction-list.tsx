"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, ArrowUpDown, ExternalLink, AlertCircle } from "lucide-react"
import { getTransactionHistory } from "@/lib/solana"
import { formatSol, formatDate, shortenAddress } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"
import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

  useEffect(() => {
    async function loadTransactions() {
      if (!walletAddress) return

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Fetching transactions for wallet: ${walletAddress}, page: ${page}`)
        const data = await getTransactionHistory(walletAddress, 20, rpcUrl)
        setTransactions(data)
      } catch (err) {
        console.error("Failed to load transactions:", err)
        setError(`Failed to fetch transaction data: ${err instanceof Error ? err.message : String(err)}`)
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [walletAddress, page, rpcUrl])

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.signature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.destination.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
              Filter
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All Transactions</DropdownMenuItem>
            <DropdownMenuItem>Incoming Only</DropdownMenuItem>
            <DropdownMenuItem>Outgoing Only</DropdownMenuItem>
            <DropdownMenuItem>Swaps Only</DropdownMenuItem>
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

      <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-secondary/20 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {error ? "Error loading transactions" : "No transactions found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.signature}>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
