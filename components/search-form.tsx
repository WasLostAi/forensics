"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SearchForm() {
  const router = useRouter()
  const [searchType, setSearchType] = useState<"wallet" | "transaction" | "token">("wallet")
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return

    setIsLoading(true)

    // In a real implementation, we would validate the input format
    if (searchType === "wallet") {
      router.push(`/wallet/${searchValue}`)
    } else if (searchType === "transaction") {
      router.push(`/transaction/${searchValue}`)
    } else if (searchType === "token") {
      router.push(`/token/${searchValue}`)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="wallet" onValueChange={(value) => setSearchType(value as "wallet" | "transaction" | "token")}>
        <TabsList className="mb-4">
          <TabsTrigger value="wallet">Wallet Address</TabsTrigger>
          <TabsTrigger value="transaction">Transaction ID</TabsTrigger>
          <TabsTrigger value="token">Token Address</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Solana wallet address"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Enter a valid Solana wallet address</p>
        </TabsContent>

        <TabsContent value="transaction">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Solana transaction signature"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Enter a valid Solana transaction signature</p>
        </TabsContent>

        <TabsContent value="token">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Solana token address"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Enter a valid Solana token address</p>
        </TabsContent>
      </Tabs>
    </form>
  )
}
