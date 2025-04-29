"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Filter, CalendarIcon, X, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"

interface AdvancedFiltersProps {
  onFilterChange: (filters: any) => void
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [amountRange, setAmountRange] = useState([0, 100])
  const [transactionTypes, setTransactionTypes] = useState<string[]>([])
  const [walletAddresses, setWalletAddresses] = useState<string[]>([])
  const [excludeExchanges, setExcludeExchanges] = useState(false)
  const [onlyHighRisk, setOnlyHighRisk] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleApplyFilters = () => {
    const filters = {
      dateRange,
      amountRange,
      transactionTypes,
      walletAddresses,
      excludeExchanges,
      onlyHighRisk,
    }

    // Update active filters for display
    const newActiveFilters = []

    if (dateRange.from) {
      newActiveFilters.push(
        `Date: ${format(dateRange.from, "MMM d, yyyy")}${dateRange.to ? ` - ${format(dateRange.to, "MMM d, yyyy")}` : ""}`,
      )
    }

    if (amountRange[0] > 0 || amountRange[1] < 100) {
      newActiveFilters.push(`Amount: ${amountRange[0]} - ${amountRange[1]} SOL`)
    }

    if (transactionTypes.length > 0) {
      newActiveFilters.push(`Types: ${transactionTypes.join(", ")}`)
    }

    if (walletAddresses.length > 0) {
      newActiveFilters.push(`Wallets: ${walletAddresses.length} selected`)
    }

    if (excludeExchanges) {
      newActiveFilters.push("Exclude Exchanges")
    }

    if (onlyHighRisk) {
      newActiveFilters.push("High Risk Only")
    }

    setActiveFilters(newActiveFilters)
    onFilterChange(filters)
  }

  const handleAddWallet = () => {
    if (newWalletAddress && !walletAddresses.includes(newWalletAddress)) {
      setWalletAddresses([...walletAddresses, newWalletAddress])
      setNewWalletAddress("")
    }
  }

  const handleRemoveWallet = (wallet: string) => {
    setWalletAddresses(walletAddresses.filter((w) => w !== wallet))
  }

  const handleToggleTransactionType = (type: string) => {
    if (transactionTypes.includes(type)) {
      setTransactionTypes(transactionTypes.filter((t) => t !== type))
    } else {
      setTransactionTypes([...transactionTypes, type])
    }
  }

  const handleClearFilters = () => {
    setDateRange({})
    setAmountRange([0, 100])
    setTransactionTypes([])
    setWalletAddresses([])
    setExcludeExchanges(false)
    setOnlyHighRisk(false)
    setActiveFilters([])
    onFilterChange({})
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setExpanded(!expanded)} className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline">
                  {filter}
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                      </PopoverContent>
                    </Popover>

                    {(dateRange.from || dateRange.to) && (
                      <Button variant="ghost" size="icon" onClick={() => setDateRange({})}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear date</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount Range (SOL)</Label>
                  <Slider value={amountRange} min={0} max={100} step={1} onValueChange={setAmountRange} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{amountRange[0]} SOL</span>
                    <span>{amountRange[1]} SOL</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {["transfer", "swap", "nft", "stake", "other"].map((type) => (
                      <Badge
                        key={type}
                        variant={transactionTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleToggleTransactionType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Related Wallets</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter wallet address"
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleAddWallet}>
                      Add
                    </Button>
                  </div>

                  {walletAddresses.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {walletAddresses.map((wallet) => (
                        <div
                          key={wallet}
                          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="font-mono truncate">{wallet}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveWallet(wallet)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exclude-exchanges">Exclude Exchange Wallets</Label>
                    <Switch id="exclude-exchanges" checked={excludeExchanges} onCheckedChange={setExcludeExchanges} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-risk-only">High Risk Transactions Only</Label>
                    <Switch id="high-risk-only" checked={onlyHighRisk} onCheckedChange={setOnlyHighRisk} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
