"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/contexts/settings-context"
import { EmptyState } from "@/components/empty-state"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TransactionFlowVisualization } from "@/components/transaction-flow-visualization"
import { useRouter } from "next/navigation"

interface TransactionFlowProps {
  walletAddress: string
}

interface TransactionNode {
  id: string
  label: string
  value: number
  group?: number
}

interface TransactionLink {
  source: string
  target: string
  value: number
  timestamp: string
}

interface TransactionFlowData {
  nodes: TransactionNode[]
  links: TransactionLink[]
}

export function TransactionFlow({ walletAddress }: TransactionFlowProps) {
  const router = useRouter()
  const { useMockData } = useSettings()
  const [data, setData] = useState<TransactionFlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"api" | "mock" | "database">("api")
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // In a real implementation, this would fetch data from your API
        // For now, we'll use mock data
        if (useMockData) {
          // Generate mock data
          const mockData = generateMockTransactionFlowData(walletAddress)
          setData(mockData)
          setDataSource("mock")
        } else {
          // Try to fetch from database or API
          // For now, just use mock data
          const mockData = generateMockTransactionFlowData(walletAddress)
          setData(mockData)
          setDataSource("mock")

          // In a real implementation, you would do:
          // const apiData = await fetchTransactionFlowFromAPI(walletAddress)
          // setData(apiData)
          // setDataSource("api")
        }
      } catch (err) {
        console.error("Error fetching transaction flow data:", err)
        setError("Failed to fetch transaction flow data. Using mock data instead.")

        // Fallback to mock data
        const mockData = generateMockTransactionFlowData(walletAddress)
        setData(mockData)
        setDataSource("mock")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [walletAddress, useMockData])

  // Function to generate mock transaction flow data
  function generateMockTransactionFlowData(centralAddress: string): TransactionFlowData {
    // Create a set of mock addresses
    const addresses = [
      centralAddress,
      "8ZUczUAUSZvMQdpiNPWWxwRdvDUduVvJo7MxJqDzsZcz",
      "5xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
      "JUP4Fb2cqiRUcaTHdrpc4QmK9tfJy6YyoGMd4Wt7CrN",
      "MarEZRBUiEuiAGCKQjSG8gKw6GGXxzuDFXMgQKJnCXc",
      "EbxGcDxGQSJ2ZT5RKAcQwUhJ3Vx1Vg2g4Hxnr6HwEPTx",
      "BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC",
    ]

    // Create nodes
    const nodes: TransactionNode[] = addresses.map((address, index) => ({
      id: address,
      label: address === centralAddress ? "Main Wallet" : `Wallet ${address.substring(0, 4)}...`,
      value: Math.floor(Math.random() * 100) + 10,
      group: address === centralAddress ? 1 : (index % 3) + 2,
    }))

    // Create links (transactions)
    const links: TransactionLink[] = []

    // Add some incoming transactions
    for (let i = 1; i < 4; i++) {
      links.push({
        source: addresses[i],
        target: centralAddress,
        value: Math.floor(Math.random() * 50) + 5,
        timestamp: new Date(Date.now() - i * 86400000).toISOString(), // Past few days
      })
    }

    // Add some outgoing transactions
    for (let i = 4; i < addresses.length; i++) {
      links.push({
        source: centralAddress,
        target: addresses[i],
        value: Math.floor(Math.random() * 30) + 5,
        timestamp: new Date(Date.now() - i * 43200000).toISOString(), // Past few days
      })
    }

    // Add some transactions between other wallets to make it more interesting
    links.push({
      source: addresses[1],
      target: addresses[2],
      value: Math.floor(Math.random() * 20) + 2,
      timestamp: new Date(Date.now() - 129600000).toISOString(),
    })

    links.push({
      source: addresses[3],
      target: addresses[5],
      value: Math.floor(Math.random() * 15) + 1,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    })

    return { nodes, links }
  }

  // Handle node click to navigate to wallet details
  const handleNodeClick = (nodeId: string) => {
    if (nodeId !== walletAddress) {
      router.push(`/wallet/${nodeId}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Flow</CardTitle>
          <CardDescription>Visualizing fund movements between wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Flow</CardTitle>
          <CardDescription>Visualizing fund movements between wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {data && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Showing mock data as a fallback. This data is not real and is only for demonstration purposes.
              </p>
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Mock Transaction Flow</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {data.nodes.length} wallets and {data.links.length} transactions found
                </p>
                <div className="space-y-2">
                  {data.links.map((link, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-mono">{link.source.substring(0, 4)}...</span> →{" "}
                      <span className="font-mono">{link.target.substring(0, 4)}...</span>:{" "}
                      <span className="font-medium">{link.value} SOL</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Flow</CardTitle>
          <CardDescription>Visualizing fund movements between wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No transaction flow data"
            description="There is no transaction flow data available for this wallet."
            icon="network"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction Flow</CardTitle>
          <CardDescription>Visualizing fund movements between wallets</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant={viewMode === "graph" ? "default" : "outline"} size="sm" onClick={() => setViewMode("graph")}>
            Graph
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dataSource === "mock" && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Using Mock Data</AlertTitle>
            <AlertDescription>
              This is simulated data for demonstration purposes. It does not represent real blockchain transactions.
            </AlertDescription>
          </Alert>
        )}

        {viewMode === "graph" ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Tip:</span> Click on a wallet node to view its details. Use the controls to
              zoom and pan the visualization.
            </div>
            <TransactionFlowVisualization nodes={data.nodes} links={data.links} onNodeClick={handleNodeClick} />
          </div>
        ) : (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Transaction Flow Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {data.nodes.length} wallets and {data.links.length} transactions found
            </p>
            <div className="space-y-2">
              {data.links.map((link, index) => (
                <div key={index} className="text-sm p-2 border border-border/50 rounded-md hover:bg-muted/30">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-mono">{link.source.substring(0, 4)}...</span> →{" "}
                      <span className="font-mono">{link.target.substring(0, 4)}...</span>
                    </div>
                    <span className="font-medium">{link.value} SOL</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(link.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">About Transaction Flow</h3>
          <p className="text-sm text-muted-foreground">
            This visualization shows how funds move between wallets. The size of each node represents the volume of
            transactions, and the thickness of each link represents the amount transferred.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
