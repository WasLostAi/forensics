"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Network, Search, History, Bookmark, Download, Upload } from "lucide-react"
import { EntityNetworkGraph } from "@/components/entity-network-graph"

export function EntityNetworkDashboard() {
  const [searchAddress, setSearchAddress] = useState("")
  const [currentAddress, setCurrentAddress] = useState("")
  const [recentAddresses, setRecentAddresses] = useState<string[]>([
    "5xot8dBbD8KA7icT4xkFZ75FfHM4Np6Wx4GK4QYBBU8U",
    "3Katmm9dhvLQijAvomteYMo6S5SBz7KMXLcjBTDwkuQQ",
    "8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6",
  ])
  const [savedAddresses, setSavedAddresses] = useState<Array<{ address: string; label: string }>>([
    { address: "5xot8dBbD8KA7icT4xkFZ75FfHM4Np6Wx4GK4QYBBU8U", label: "Exchange Hot Wallet" },
    { address: "3Katmm9dhvLQijAvomteYMo6S5SBz7KMXLcjBTDwkuQQ", label: "Mixer Service" },
  ])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchAddress.trim()) {
      setCurrentAddress(searchAddress.trim())

      // Add to recent addresses if not already there
      if (!recentAddresses.includes(searchAddress.trim())) {
        setRecentAddresses((prev) => [searchAddress.trim(), ...prev.slice(0, 4)])
      }
    }
  }

  const handleSelectAddress = (address: string) => {
    setSearchAddress(address)
    setCurrentAddress(address)
  }

  const handleSaveAddress = () => {
    if (currentAddress && !savedAddresses.some((item) => item.address === currentAddress)) {
      const label = prompt("Enter a label for this address:")
      if (label) {
        setSavedAddresses((prev) => [...prev, { address: currentAddress, label }])
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entity Network Explorer</h2>
          <p className="text-muted-foreground">Visualize connections between entities on the Solana blockchain</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter wallet address..."
              className="pl-8 w-full md:w-[300px]"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
          </div>
          <Button type="submit">Explore</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <History className="mr-2 h-4 w-4" />
                Recent Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recentAddresses.map((address) => (
                  <li key={address}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs font-mono truncate"
                      onClick={() => handleSelectAddress(address)}
                    >
                      {address}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedAddresses.length > 0 ? (
                <ul className="space-y-2">
                  {savedAddresses.map((item) => (
                    <li key={item.address} className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs font-mono truncate"
                        onClick={() => handleSelectAddress(item.address)}
                      >
                        {item.address}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
              )}

              {currentAddress && (
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleSaveAddress}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save Current Address
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Network Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Display Mode</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button variant="outline" size="sm" className="justify-center">
                      2D
                    </Button>
                    <Button variant="outline" size="sm" className="justify-center">
                      3D
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Entity Types</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">Exchange</Badge>
                    <Badge variant="outline">Mixer</Badge>
                    <Badge variant="outline">Contract</Badge>
                    <Badge variant="outline">Individual</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              {currentAddress ? (
                <EntityNetworkGraph address={currentAddress} />
              ) : (
                <div className="flex items-center justify-center h-full flex-col gap-4 p-6 text-center">
                  <Network className="h-16 w-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-medium">No Address Selected</h3>
                    <p className="text-muted-foreground">
                      Enter a wallet address above to visualize its network connections
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
