"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Info, Lightbulb } from "lucide-react"
import type { MLPatternResult, MLModelMetadata } from "@/types/ml"

interface MLPatternVisualizationProps {
  patterns: MLPatternResult[]
  modelMetadata?: MLModelMetadata[]
  walletAddress: string
}

export function MLPatternVisualization({ patterns, modelMetadata, walletAddress }: MLPatternVisualizationProps) {
  const [expandedPatterns, setExpandedPatterns] = useState<string[]>([])
  const [showModelInfo, setShowModelInfo] = useState(false)

  const togglePattern = (patternId: string) => {
    setExpandedPatterns((prev) =>
      prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId],
    )
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
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Pattern Analysis
          </CardTitle>
          <CardDescription>No suspicious patterns detected by machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            Machine learning models did not detect any suspicious patterns in the transaction history
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group patterns by type
  const anomalyPatterns = patterns.filter((p) => p.type === "anomaly")
  const classifiedPatterns = patterns.filter((p) => p.type === "ml_pattern")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              ML Pattern Analysis
            </CardTitle>
            <CardDescription>Machine learning detected {patterns.length} suspicious patterns</CardDescription>
          </div>
          <button
            onClick={() => setShowModelInfo(!showModelInfo)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            {showModelInfo ? "Hide" : "Show"} Model Info
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {showModelInfo && modelMetadata && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md text-xs">
            <h4 className="font-medium mb-2">ML Model Information</h4>
            <div className="grid grid-cols-2 gap-2">
              {modelMetadata.map((model, index) => (
                <div key={index} className="p-2 border rounded-md">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-muted-foreground">{model.description}</div>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <div>Accuracy: {(model.performance.accuracy * 100).toFixed(1)}%</div>
                    <div>Precision: {(model.performance.precision * 100).toFixed(1)}%</div>
                    <div>Recall: {(model.performance.recall * 100).toFixed(1)}%</div>
                    <div>F1 Score: {(model.performance.f1Score * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ML Patterns</TabsTrigger>
            <TabsTrigger value="anomalies">
              Anomalies
              {anomalyPatterns.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {anomalyPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="classified">
              Classified Patterns
              {classifiedPatterns.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {classifiedPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {patterns.map((pattern, index) => (
              <MLPatternCard
                key={`${pattern.type}-${index}`}
                pattern={pattern}
                isExpanded={expandedPatterns.includes(`${pattern.type}-${index}`)}
                onToggle={() => togglePattern(`${pattern.type}-${index}`)}
              />
            ))}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {anomalyPatterns.length > 0 ? (
              anomalyPatterns.map((pattern, index) => (
                <MLPatternCard
                  key={`anomaly-${index}`}
                  pattern={pattern}
                  isExpanded={expandedPatterns.includes(`anomaly-${index}`)}
                  onToggle={() => togglePattern(`anomaly-${index}`)}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground p-4">No anomalies detected</div>
            )}
          </TabsContent>

          <TabsContent value="classified" className="space-y-4">
            {classifiedPatterns.length > 0 ? (
              classifiedPatterns.map((pattern, index) => (
                <MLPatternCard
                  key={`classified-${index}`}
                  pattern={pattern}
                  isExpanded={expandedPatterns.includes(`classified-${index}`)}
                  onToggle={() => togglePattern(`classified-${index}`)}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground p-4">No classified patterns detected</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface MLPatternCardProps {
  pattern: MLPatternResult
  isExpanded: boolean
  onToggle: () => void
}

function MLPatternCard({ pattern, isExpanded, onToggle }: MLPatternCardProps) {
  const getPatternIcon = (type: string) => {
    if (type === "anomaly") return <AlertTriangle className="h-5 w-5 text-amber-500" />
    return <Lightbulb className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <div className="flex items-center gap-2">
          {getPatternIcon(pattern.type)}
          <div>
            <div className="font-medium">{pattern.name}</div>
            <div className="text-xs text-muted-foreground">{pattern.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant(pattern.severity)}>{pattern.severity}</Badge>
          <div className="text-xs font-medium">
            {pattern.confidence ? `${(pattern.confidence * 100).toFixed(0)}%` : `${pattern.score}%`}
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-t">
          <div className="mt-2 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Confidence Score</span>
                <span className="text-xs font-medium">{pattern.score}%</span>
              </div>
              <Progress value={pattern.score} className="h-2" />
            </div>

            <div>
              <h4 className="text-xs font-medium mb-1">Key Features</h4>
              <div className="grid grid-cols-1 gap-1">
                {pattern.featureImportance.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span>{feature.name}</span>
                    <div className="flex items-center gap-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.max(feature.importance * 100, 5)}px` }}
                      />
                      <span>{(feature.importance * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pattern.transactions && pattern.transactions.length > 0 && (
              <div>
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

            <div>
              <h4 className="text-xs font-medium mb-1">Model Information</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="p-1 bg-muted rounded">
                  <span className="font-medium">Model Type:</span> {pattern.modelMetadata.modelType}
                </div>
                <div className="p-1 bg-muted rounded">
                  <span className="font-medium">Version:</span> {pattern.modelMetadata.version}
                </div>
                {pattern.modelMetadata.patternType && (
                  <div className="p-1 bg-muted rounded">
                    <span className="font-medium">Pattern Type:</span>{" "}
                    {pattern.modelMetadata.patternType.replace(/_/g, " ")}
                  </div>
                )}
                {pattern.modelMetadata.threshold && (
                  <div className="p-1 bg-muted rounded">
                    <span className="font-medium">Threshold:</span> {pattern.modelMetadata.threshold}
                  </div>
                )}
                {pattern.modelMetadata.sequenceLength && (
                  <div className="p-1 bg-muted rounded">
                    <span className="font-medium">Sequence Length:</span> {pattern.modelMetadata.sequenceLength}
                  </div>
                )}
              </div>
            </div>
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
