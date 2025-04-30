"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Network, Activity, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import type { TransactionPattern, PatternResult } from "@/types/risk"

interface PatternVisualizationProps {
  patterns: TransactionPattern[]
  walletAddress: string
}

export function PatternVisualization({ patterns, walletAddress }: PatternVisualizationProps) {
  const [expandedPatterns, setExpandedPatterns] = useState<string[]>([])

  const togglePattern = (patternId: string) => {
    setExpandedPatterns((prev) =>
      prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId],
    )
  }

  const getPatternIcon = (type: string) => {
    switch (type) {
      case "time_based":
        return <Clock className="h-5 w-5" />
      case "amount_based":
        return <DollarSign className="h-5 w-5" />
      case "flow_based":
        return <Network className="h-5 w-5" />
      case "behavioral":
        return <Activity className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getPatternColor = (type: string) => {
    switch (type) {
      case "time_based":
        return "text-blue-500"
      case "amount_based":
        return "text-green-500"
      case "flow_based":
        return "text-purple-500"
      case "behavioral":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (!patterns || patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Analysis</CardTitle>
          <CardDescription>No suspicious patterns detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            No suspicious patterns were detected in the transaction history
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspicious Pattern Analysis</CardTitle>
        <CardDescription>
          Advanced pattern detection identified {patterns.reduce((sum, p) => sum + p.patternCount, 0)} suspicious
          patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Patterns</TabsTrigger>
            {patterns.map((pattern) => (
              <TabsTrigger key={pattern.type} value={pattern.type}>
                {pattern.type.split("_")[0].charAt(0).toUpperCase() + pattern.type.split("_")[0].slice(1)}
                {pattern.highSeverityCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pattern.highSeverityCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {patterns.map((patternGroup) => (
              <div key={patternGroup.type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={getPatternColor(patternGroup.type)}>{getPatternIcon(patternGroup.type)}</span>
                  <h3 className="text-lg font-semibold">
                    {patternGroup.type
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}{" "}
                    Patterns
                  </h3>
                  <Badge variant={patternGroup.highSeverityCount > 0 ? "destructive" : "secondary"}>
                    {patternGroup.patternCount} detected
                  </Badge>
                </div>

                <div className="pl-7 space-y-2">
                  {patternGroup.patterns.map((pattern, index) => (
                    <PatternCard
                      key={`${patternGroup.type}-${index}`}
                      pattern={pattern}
                      isExpanded={expandedPatterns.includes(`${patternGroup.type}-${index}`)}
                      onToggle={() => togglePattern(`${patternGroup.type}-${index}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {patterns.map((patternGroup) => (
            <TabsContent key={patternGroup.type} value={patternGroup.type} className="space-y-3">
              {patternGroup.patterns.map((pattern, index) => (
                <PatternCard
                  key={`${patternGroup.type}-${index}`}
                  pattern={pattern}
                  isExpanded={expandedPatterns.includes(`${patternGroup.type}-${index}`)}
                  onToggle={() => togglePattern(`${patternGroup.type}-${index}`)}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface PatternCardProps {
  pattern: PatternResult
  isExpanded: boolean
  onToggle: () => void
}

function PatternCard({ pattern, isExpanded, onToggle }: PatternCardProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-6 rounded-full"
            style={{
              backgroundColor:
                pattern.severity === "high"
                  ? "rgb(239, 68, 68)"
                  : pattern.severity === "medium"
                    ? "rgb(234, 179, 8)"
                    : "rgb(34, 197, 94)",
            }}
          />
          <div>
            <div className="font-medium">{pattern.name}</div>
            <div className="text-xs text-muted-foreground">{pattern.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant(pattern.severity)}>{pattern.severity}</Badge>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-t">
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Pattern Score</span>
              <span className="text-sm font-medium">{pattern.score}/100</span>
            </div>

            {pattern.transactions && pattern.transactions.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium mb-1">Related Transactions</h4>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {pattern.transactions.slice(0, 5).map((tx, i) => (
                    <div key={i} className="text-xs p-1 bg-muted rounded flex items-center justify-between">
                      <span className="truncate">
                        {tx.substring(0, 8)}...{tx.substring(tx.length - 4)}
                      </span>
                      <a
                        href={`/transaction/${tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                  {pattern.transactions.length > 5 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{pattern.transactions.length - 5} more transactions
                    </div>
                  )}
                </div>
              </div>
            )}

            {pattern.metadata && (
              <div className="mt-3">
                <h4 className="text-xs font-medium mb-1">Pattern Details</h4>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(pattern.metadata).map(([key, value]) => (
                    <div key={key} className="text-xs p-1 bg-muted rounded">
                      <span className="font-medium">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                      </span>{" "}
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : typeof value === "number"
                          ? value.toLocaleString()
                          : String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getBadgeVariant(severity: string) {
  switch (severity) {
    case "high":
      return "destructive"
    case "medium":
      return "warning"
    case "low":
      return "outline"
    default:
      return "secondary"
  }
}
