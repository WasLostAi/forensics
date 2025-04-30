"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EntityNetworkGraph } from "@/components/entity-network-graph"
import { Search, Network, History, BookmarkPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import type { EntityNode } from "@/types/entity-graph"

export function EntityNetworkDashboard() {
  const [searchAddress, setSearchAddress] = useState("")
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const [recentAddresses, setRecentAddresses] = useState<Array<{ address: string; label: string }>>([])
  const [savedAddresses, setSavedAddresses] = useState<Array<{ address: string; label: string; notes?: string }>>([])
  const router = useRouter()

  const handleSearch = () => {
    if (!searchAddress.trim()) return

    setCurrentAddress(searchAddress)

    // Add to recent addresses if not already there
    if (!recentAddresses.some((item) => item.address === searchAddress)) {
      setRecentAddresses((prev) => [
        {
          address: searchAddress,
          label: `Address ${searchAddress.substring(0, 6)}...${searchAddress.substring(searchAddress.length - 4)}`,
        },
        ...prev.slice(0, 9),
      ])
    }
  }

  const handleSaveAddress = () => {
    if (!currentAddress || savedAddresses.some((item) => item.address === currentAddress)) return

    setSavedAddresses((prev) => [
      {
        address: currentAddress,
        label: `Address ${currentAddress.substring(0, 6)}...${currentAddress.substring(currentAddress.length - 4)}`,
      },
      ...prev,
    ])
  }

  const handleNodeClick = (node: EntityNode) => {
    router.push(`/entity-network/${node.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Entity Network Explorer</CardTitle>
            <CardDescription>
              Visualize and explore connections between entities on the Solana blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter wallet address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>

            {currentAddress && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Address</p>
                  <p className="text-xs text-muted-foreground break-all">{currentAddress}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSaveAddress}>
                  <BookmarkPlus className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            )}

            <Tabs defaultValue="recent">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-2 mt-2">
                {recentAddresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent addresses</p>
                ) : (
                  recentAddresses.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => {
                        setSearchAddress(item.address)
                        setCurrentAddress(item.address)
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.address.substring(0, 10)}...{item.address.substring(item.address.length - 6)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        <History className="h-3 w-3 mr-1" /> Recent
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-2 mt-2">
                {savedAddresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No saved addresses</p>
                ) : (
                  savedAddresses.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => {
                        setSearchAddress(item.address)
                        setCurrentAddress(item.address)
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.address.substring(0, 10)}...{item.address.substring(item.address.length - 6)}
                        </p>
                      </div>
                      <Badge>
                        <BookmarkPlus className="h-3 w-3 mr-1" /> Saved
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Network className="h-4 w-4" /> Network Analysis Tools
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/entity-clusters")}>
                  Entity Clusters
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/entities/management")}>
                  Entity Management
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/entities/bulk")}>
                  Bulk Operations
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/analytics")}>
                  Network Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardContent className="p-0">
            {currentAddress ? (
              <EntityNetworkGraph centralAddress={currentAddress} height={600} onNodeClick={handleNodeClick} />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-accent/10 rounded-md">
                <div className="text-center space-y-2">
                  <Network className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <h3 className="text-xl font-medium">No Address Selected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter a wallet address in the search box to visualize its network connections
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
