"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface ICOTransactionHistoryProps {
  address: string
}

export function ICOTransactionHistory({ address }: ICOTransactionHistoryProps) {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<
    {
      hash: string
      timestamp: string
      type: "in" | "out"
      amount: number
      from: string
      to: string
      fromLabel?: string
      toLabel?: string
    }[]
  >([])

  useEffect(() => {
    // In a real implementation, this would fetch transaction data
    // For now, we'll use mock data
    const mockTransactions = [
      {
        hash: "5xGT7...Kj9p2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        type: "in" as const,
        amount: 500000,
        from: "Investor1",
        to: address,
        fromLabel: "Whale Investor",
      },
      {
        hash: "8pLM3...Rt5q7",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
        type: "out" as const,
        amount: 200000,
        from: address,
        to: "ExchangeAddress1",
        toLabel: "Binance",
      },
      {
        hash: "2nVB6...Zx3f8",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        type: "out" as const,
        amount: 100000,
        from: address,
        to: "TeamWallet1",
        toLabel: "Team Wallet",
      },
      {
        hash: "7kQR9...Wp2d4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        type: "out" as const,
        amount: 50000,
        from: address,
        to: "MixerAddress1",
        toLabel: "Tornado Cash Solana",
      },
    ]

    setTimeout(() => {
      setTransactions(mockTransactions)
      setLoading(false)
    }, 1000)
  }, [address])

  const getTransactionTypeBadge = (type: "in" | "out") => {
    return type === "in" ? (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">
        Inflow
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">
        Outflow
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Recent token transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">
                  <div className="flex items-center">
                    {tx.hash}
                    <Button variant="ghost" size="icon" className="ml-1" asChild>
                      <a href={`https://solscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                <TableCell>{getTransactionTypeBadge(tx.type)}</TableCell>
                <TableCell>{tx.fromLabel || tx.from.substring(0, 6)}...</TableCell>
                <TableCell>{tx.toLabel || tx.to.substring(0, 6)}...</TableCell>
                <TableCell className="text-right">${tx.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
