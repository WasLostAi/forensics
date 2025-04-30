"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { X, Search, Filter, Save, Clock, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type EntitySearchFilter = {
  id: string
  field: string
  operator: string
  value: string | number | boolean | string[] | number[]
  active: boolean
}

export type SavedSearch = {
  id: string
  name: string
  filters: EntitySearchFilter[]
  createdAt: string
}

interface EntityAdvancedSearchProps {
  onSearch: (filters: EntitySearchFilter[]) => void
  initialFilters?: EntitySearchFilter[]
}

export function EntityAdvancedSearch({ onSearch, initialFilters = [] }: EntityAdvancedSearchProps) {
  const [filters, setFilters] = useState<EntitySearchFilter[]>(initialFilters)
  const [expanded, setExpanded] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [searchName, setSearchName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { toast } = useToast()

  // Load saved searches from local storage on component mount
  useEffect(() => {
    const savedSearchesJson = localStorage.getItem("entitySavedSearches")
    if (savedSearchesJson) {
      try {
        const parsed = JSON.parse(savedSearchesJson)
        setSavedSearches(parsed)
      } catch (e) {
        console.error("Failed to parse saved searches:", e)
      }
    }
  }, [])

  // Memoize the search callback to prevent infinite loops
  const handleSearchCallback = useCallback(() => {
    const activeFilters = filters.filter((f) => f.active)
    onSearch(activeFilters)
  }, [filters, onSearch])

  // Apply search when filters change
  useEffect(() => {
    handleSearchCallback()
  }, [handleSearchCallback])

  const addFilter = () => {
    const newFilter: EntitySearchFilter = {
      id: `filter-${Date.now()}`,
      field: "label",
      operator: "contains",
      value: "",
      active: true,
    }
    setFilters([...filters, newFilter])
    setExpanded(true)
  }

  const updateFilter = (id: string, updates: Partial<EntitySearchFilter>) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id === id) {
          return { ...filter, ...updates }
        }
        return filter
      }),
    )
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter((filter) => filter.id !== id))
  }

  const toggleFilterActive = (id: string) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id === id) {
          return { ...filter, active: !filter.active }
        }
        return filter
      }),
    )
  }

  const clearAllFilters = () => {
    setFilters([])
  }

  const saveSearch = () => {
    if (!searchName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a name for your search",
      })
      return
    }

    const newSavedSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name: searchName,
      filters: [...filters],
      createdAt: new Date().toISOString(),
    }

    const updatedSavedSearches = [...savedSearches, newSavedSearch]
    setSavedSearches(updatedSavedSearches)
    localStorage.setItem("entitySavedSearches", JSON.stringify(updatedSavedSearches))

    setSearchName("")
    setShowSaveDialog(false)

    toast({
      title: "Search saved",
      description: `"${searchName}" has been saved successfully.`,
    })
  }

  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters)
    setExpanded(true)

    toast({
      title: "Search loaded",
      description: `"${search.name}" has been loaded.`,
    })
  }

  const deleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedSavedSearches = savedSearches.filter((search) => search.id !== id)
    setSavedSearches(updatedSavedSearches)
    localStorage.setItem("entitySavedSearches", JSON.stringify(updatedSavedSearches))

    toast({
      title: "Search deleted",
      description: "The saved search has been deleted.",
    })
  }

  const getOperatorOptions = (field: string) => {
    switch (field) {
      case "label":
      case "address":
      case "notes":
        return [
          { value: "contains", label: "Contains" },
          { value: "equals", label: "Equals" },
          { value: "startsWith", label: "Starts with" },
          { value: "endsWith", label: "Ends with" },
        ]
      case "category":
      case "source":
        return [{ value: "equals", label: "Equals" }]
      case "tags":
        return [
          { value: "includes", label: "Includes" },
          { value: "excludes", label: "Excludes" },
        ]
      case "riskScore":
      case "confidence":
        return [
          { value: "equals", label: "Equals" },
          { value: "greaterThan", label: "Greater than" },
          { value: "lessThan", label: "Less than" },
          { value: "between", label: "Between" },
        ]
      case "verified":
      case "inCluster":
        return [{ value: "equals", label: "Equals" }]
      case "createdAt":
      case "updatedAt":
        return [
          { value: "before", label: "Before" },
          { value: "after", label: "After" },
          { value: "between", label: "Between" },
        ]
      default:
        return [{ value: "equals", label: "Equals" }]
    }
  }

  const getValueInput = (filter: EntitySearchFilter) => {
    switch (filter.field) {
      case "label":
      case "address":
      case "notes":
        return (
          <Input
            placeholder={`Enter ${filter.field}...`}
            value={filter.value as string}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="flex-1"
          />
        )
      case "category":
        return (
          <Select value={filter.value as string} onValueChange={(value) => updateFilter(filter.id, { value })}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="mixer">Mixer</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="scam">Scam</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        )
      case "source":
        return (
          <Select value={filter.value as string} onValueChange={(value) => updateFilter(filter.id, { value })}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="algorithm">Algorithm</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        )
      case "tags":
        return (
          <div className="flex-1">
            <Input
              placeholder="Enter tags (comma separated)"
              value={Array.isArray(filter.value) ? (filter.value as string[]).join(", ") : filter.value}
              onChange={(e) => {
                const tagsArray = e.target.value.split(",").map((tag) => tag.trim())
                updateFilter(filter.id, { value: tagsArray })
              }}
            />
          </div>
        )
      case "riskScore":
        if (filter.operator === "between") {
          return (
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Min: {Array.isArray(filter.value) ? filter.value[0] : 0}</span>
                <span className="text-sm">Max: {Array.isArray(filter.value) ? filter.value[1] : 100}</span>
              </div>
              <Slider
                defaultValue={[0, 100]}
                value={Array.isArray(filter.value) ? (filter.value as number[]) : [0, 100]}
                onValueChange={(value) => updateFilter(filter.id, { value })}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          )
        }
        return (
          <div className="flex-1 space-y-2">
            <Slider
              defaultValue={[50]}
              value={[typeof filter.value === "number" ? filter.value : 50]}
              onValueChange={(value) => updateFilter(filter.id, { value: value[0] })}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="text-center text-sm">{typeof filter.value === "number" ? filter.value : 50}</div>
          </div>
        )
      case "confidence":
        if (filter.operator === "between") {
          return (
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Min: {Array.isArray(filter.value) ? (filter.value[0] as number) * 100 : 0}%
                </span>
                <span className="text-sm">
                  Max: {Array.isArray(filter.value) ? (filter.value[1] as number) * 100 : 100}%
                </span>
              </div>
              <Slider
                defaultValue={[0, 1]}
                value={Array.isArray(filter.value) ? (filter.value as number[]) : [0, 1]}
                onValueChange={(value) => updateFilter(filter.id, { value })}
                max={1}
                step={0.01}
                className="flex-1"
              />
            </div>
          )
        }
        return (
          <div className="flex-1 space-y-2">
            <Slider
              defaultValue={[0.5]}
              value={[typeof filter.value === "number" ? (filter.value as number) : 0.5]}
              onValueChange={(value) => updateFilter(filter.id, { value: value[0] })}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <div className="text-center text-sm">
              {typeof filter.value === "number" ? (filter.value as number) * 100 : 50}%
            </div>
          </div>
        )
      case "verified":
      case "inCluster":
        return (
          <div className="flex items-center space-x-2 flex-1">
            <Switch
              checked={filter.value as boolean}
              onCheckedChange={(checked) => updateFilter(filter.id, { value: checked })}
            />
            <Label>{filter.value ? "Yes" : "No"}</Label>
          </div>
        )
      case "createdAt":
      case "updatedAt":
        if (filter.operator === "between") {
          return (
            <div className="flex flex-col space-y-2 flex-1">
              <Input
                type="date"
                value={Array.isArray(filter.value) ? (filter.value[0] as string) : ""}
                onChange={(e) => {
                  const currentValue = Array.isArray(filter.value) ? filter.value : ["", ""]
                  updateFilter(filter.id, { value: [e.target.value, currentValue[1]] })
                }}
                className="flex-1"
              />
              <Input
                type="date"
                value={Array.isArray(filter.value) ? (filter.value[1] as string) : ""}
                onChange={(e) => {
                  const currentValue = Array.isArray(filter.value) ? filter.value : ["", ""]
                  updateFilter(filter.id, { value: [currentValue[0], e.target.value] })
                }}
                className="flex-1"
              />
            </div>
          )
        }
        return (
          <Input
            type="date"
            value={filter.value as string}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="flex-1"
          />
        )
      default:
        return (
          <Input
            placeholder="Enter value..."
            value={filter.value as string}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="flex-1"
          />
        )
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Search header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Entity Search</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="h-8 px-2 text-xs">
                {expanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Simple
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Advanced
                  </>
                )}
              </Button>

              <Popover open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Save Search</h4>
                    <div className="space-y-2">
                      <Label htmlFor="search-name">Search Name</Label>
                      <Input
                        id="search-name"
                        placeholder="Enter a name for this search"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveSearch}>
                        Save
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                    <Clock className="mr-1 h-4 w-4" />
                    Recent
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-2">
                    <h4 className="px-2 py-1.5 text-sm font-medium">Saved Searches</h4>
                    {savedSearches.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">No saved searches yet</div>
                    ) : (
                      <div className="max-h-[300px] overflow-auto">
                        {savedSearches.map((search) => (
                          <div
                            key={search.id}
                            className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent"
                            onClick={() => loadSavedSearch(search)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{search.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(search.createdAt).toLocaleDateString()} • {search.filters.length} filter(s)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => deleteSavedSearch(search.id, e)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Simple search (when not expanded) */}
          {!expanded && (
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities by name, address, or tag..."
                  className="pl-8"
                  value={(filters.find((f) => f.field === "label" && f.operator === "contains")?.value as string) || ""}
                  onChange={(e) => {
                    const existingFilter = filters.find((f) => f.field === "label" && f.operator === "contains")
                    if (existingFilter) {
                      updateFilter(existingFilter.id, { value: e.target.value })
                    } else {
                      const newFilter: EntitySearchFilter = {
                        id: `filter-${Date.now()}`,
                        field: "label",
                        operator: "contains",
                        value: e.target.value,
                        active: true,
                      }
                      setFilters([...filters, newFilter])
                    }
                  }}
                />
              </div>
              <Select
                value={(filters.find((f) => f.field === "category" && f.operator === "equals")?.value as string) || ""}
                onValueChange={(value) => {
                  const existingFilter = filters.find((f) => f.field === "category" && f.operator === "equals")
                  if (existingFilter) {
                    updateFilter(existingFilter.id, { value })
                  } else if (value !== "all") {
                    const newFilter: EntitySearchFilter = {
                      id: `filter-${Date.now()}`,
                      field: "category",
                      operator: "equals",
                      value,
                      active: true,
                    }
                    setFilters([...filters, newFilter])
                  } else {
                    // If "all" is selected, remove any category filter
                    setFilters(filters.filter((f) => !(f.field === "category" && f.operator === "equals")))
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="exchange">Exchanges</SelectItem>
                  <SelectItem value="mixer">Mixers</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                  <SelectItem value="individual">Individuals</SelectItem>
                  <SelectItem value="scam">Scams</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Active filters display */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className={cn(
                    "flex items-center space-x-1 bg-background/50 px-2 py-1",
                    !filter.active && "opacity-50",
                  )}
                >
                  <span className="text-xs font-medium">{filter.field}</span>
                  <span className="text-xs text-muted-foreground">{filter.operator}</span>
                  <span className="text-xs">
                    {Array.isArray(filter.value)
                      ? filter.value.join(", ")
                      : typeof filter.value === "boolean"
                        ? filter.value
                          ? "Yes"
                          : "No"
                        : filter.value.toString()}
                  </span>
                  <button className="ml-1 rounded-full hover:bg-accent" onClick={() => toggleFilterActive(filter.id)}>
                    <Checkbox checked={filter.active} className="h-3 w-3" />
                  </button>
                  <button className="ml-1 rounded-full hover:bg-accent" onClick={() => removeFilter(filter.id)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
                  Clear All
                </Button>
              )}
            </div>
          )}

          {/* Advanced search (when expanded) */}
          {expanded && (
            <div className="space-y-4">
              <Separator />

              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filter.active}
                    onCheckedChange={() => toggleFilterActive(filter.id)}
                    className="h-4 w-4"
                  />

                  <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Basic</SelectLabel>
                        <SelectItem value="label">Label</SelectItem>
                        <SelectItem value="address">Address</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="tags">Tags</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Metadata</SelectLabel>
                        <SelectItem value="source">Source</SelectItem>
                        <SelectItem value="confidence">Confidence</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="riskScore">Risk Score</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Advanced</SelectLabel>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="updatedAt">Updated Date</SelectItem>
                        <SelectItem value="inCluster">In Cluster</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorOptions(filter.field).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {getValueInput(filter)}

                  <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addFilter} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
