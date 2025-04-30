"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, ArrowDown, ArrowUp, Check, Download, FileJson, Loader2, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EntityImportExport() {
  const [activeTab, setActiveTab] = useState("import")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  // Import state
  const [importFormat, setImportFormat] = useState("json")
  const [importData, setImportData] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)

  // Export state
  const [exportFormat, setExportFormat] = useState("json")
  const [includeConnections, setIncludeConnections] = useState(true)
  const [includeClusters, setIncludeClusters] = useState(true)
  const [exportData, setExportData] = useState("")

  const handleImport = async () => {
    if (!importData.trim() && !importFile) {
      setError("Please enter data or select a file to import")
      return
    }

    setError(null)
    setSuccess(null)
    setIsProcessing(true)

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, this would parse and validate the data
      const entityCount = Math.floor(Math.random() * 50) + 10

      setSuccess(`Successfully imported ${entityCount} entities`)
      toast({
        title: "Import complete",
        description: `Successfully imported ${entityCount} entities.`,
      })
    } catch (error) {
      console.error("Failed to import data:", error)
      setError("Failed to import data. Please check the format and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    setError(null)
    setSuccess(null)
    setIsProcessing(true)

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, this would fetch and format the data
      const mockData = {
        entities: [
          {
            id: "1",
            address: "14FUT96s9swbmH7ZjpDvfEDywnAYy9zaNhv4HvB8F7oA",
            label: "Binance Hot Wallet",
            category: "exchange",
            confidence: 0.95,
            source: "community",
            verified: true,
            riskScore: 10,
            tags: ["exchange", "high-volume"],
          },
          {
            id: "2",
            address: "5xoBq7f7CDgZwqHrDBdRWM84ExRetg4gZq93dyJtoSwp",
            label: "High Volume Trader",
            category: "individual",
            confidence: 0.75,
            source: "algorithm",
            riskScore: 35,
            tags: ["trader", "high-volume"],
          },
        ],
        connections: includeConnections
          ? [
              {
                sourceEntityId: "1",
                targetEntityId: "2",
                relationshipType: "interacts_with",
                strength: 0.8,
              },
            ]
          : [],
        clusters: includeClusters
          ? [
              {
                id: "cluster-1",
                name: "Exchange Network",
                entities: ["1", "2"],
              },
            ]
          : [],
      }

      setExportData(JSON.stringify(mockData, null, 2))
      setSuccess("Data exported successfully")
    } catch (error) {
      console.error("Failed to export data:", error)
      setError("Failed to export data. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImportData(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    if (!exportData) return

    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `entity-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="import">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Entities</CardTitle>
              <CardDescription>Import entity data from JSON or CSV files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-format">Format</Label>
                  <Select value={importFormat} onValueChange={setImportFormat} disabled={isProcessing}>
                    <SelectTrigger id="import-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-file">Upload File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept={importFormat === "json" ? ".json" : ".csv"}
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                  <p className="text-sm text-muted-foreground">Or paste data directly below</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-data">Data</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder={
                      importFormat === "json"
                        ? '{"entities": [{"address": "...", "label": "..."}]}'
                        : "address,label,category,confidence,source"
                    }
                    rows={10}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleImport} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Entities</CardTitle>
              <CardDescription>Export your entity database for backup or sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat} disabled={isProcessing}>
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-connections"
                    checked={includeConnections}
                    onChange={(e) => setIncludeConnections(e.target.checked)}
                    disabled={isProcessing}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-connections">Include entity connections</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-clusters"
                    checked={includeClusters}
                    onChange={(e) => setIncludeClusters(e.target.checked)}
                    disabled={isProcessing}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-clusters">Include entity clusters</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button onClick={handleExport} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Generate Export
                      </>
                    )}
                  </Button>
                </div>

                {exportData && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="export-data">Export Data</Label>
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <FileJson className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <Textarea id="export-data" value={exportData} readOnly rows={10} className="font-mono text-xs" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
