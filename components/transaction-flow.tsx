"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { TransactionFlowData } from "@/types/transaction"
import { fetchArkhamTransactionFlow } from "@/lib/arkham-api"
import { useSettings } from "@/contexts/settings-context"

interface TransactionFlowProps {
  walletAddress?: string
  initialData?: TransactionFlowData
}

export function TransactionFlow({ walletAddress, initialData }: TransactionFlowProps) {
  const [address, setAddress] = useState(walletAddress || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TransactionFlowData | null>(initialData || null)
  const { rpcUrl } = useSettings()

  const fetchData = async (addr: string) => {
    if (!addr) return

    setIsLoading(true)
    setError(null)

    try {
      const flowData = await fetchArkhamTransactionFlow(addr)
      setData(flowData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transaction flow data")
      console.error("Error fetching transaction flow:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(address)
  }

  useEffect(() => {
    if (walletAddress) {
      setAddress(walletAddress)
      fetchData(walletAddress)
    }
  }, [walletAddress])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Flow Analysis</CardTitle>
          <CardDescription>Visualize the flow of funds between wallets using Arkham Exchange data</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="wallet-address" className="sr-only">
                Wallet Address
              </Label>
              <Input
                id="wallet-address"
                placeholder="Enter Solana wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !address}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Fetching transaction data from Arkham Exchange...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Wallets</CardTitle>
              <CardDescription>
                Wallets that have transacted with {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.nodes.length <= 1 ? (
                <div className="text-center py-4 text-muted-foreground">No connected wallets found</div>
              ) : (
                <div className="space-y-2">
                  {data.nodes
                    .filter((node) => node.id !== address)
                    .map((node) => (
                      <div key={node.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                          <div className="font-medium">{node.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {node.id.substring(0, 8)}...{node.id.substring(node.id.length - 8)}
                          </div>
                        </div>
                        <div className="text-sm bg-muted px-2 py-1 rounded">Group: {node.group}</div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Recent transactions involving this wallet</CardDescription>
            </CardHeader>
            <CardContent>
              {data.links.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No transactions found</div>
              ) : (
                <div className="space-y-2">
                  {data.links.map((link, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {link.source.substring(0, 6)}...{link.source.substring(link.source.length - 4)} →{" "}
                          {link.target.substring(0, 6)}...{link.target.substring(link.target.length - 4)}
                        </div>
                        <div className="text-sm font-medium">{link.value} SOL</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(link.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>About Transaction Flow</AlertTitle>
            <AlertDescription>
              This visualization shows the flow of funds between wallets. For a more detailed analysis, consider
              exporting this data or using the advanced filters.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
