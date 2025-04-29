"use client"

import { useState } from "react"
import { AlertTriangle, Download, FileUp, FileDown, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { EntityLabel } from "@/types/entity"

interface EntityLabelImportExportProps {
  onImportComplete?: () => void
}

export function EntityLabelImportExport({ onImportComplete }: EntityLabelImportExportProps) {
  const [activeTab, setActiveTab] = useState("import")
  const [isProcessing, setIsProcessing] = useState(false)
  const [importData, setImportData] = useState("")
  const [exportData, setExportData] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleImport = async () => {
    if (!importData.trim()) {
      setError("Please enter data to import")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      let data: EntityLabel[]

      try {
        data = JSON.parse(importData)

        if (!Array.isArray(data)) {
          throw new Error("Imported data must be an array of entity labels")
        }
      } catch (err) {
        throw new Error("Invalid JSON format. Please check your data.")
      }

      // Validate the data
      for (const label of data) {
        if (!label.address || !label.label || !label.category) {
          throw new Error("Each entity label must have an address, label, and category")
        }
      }

      // In a real implementation, you would save each label to the database
      // For now, we'll just simulate success

      setSuccess(`Successfully imported ${data.length} entity labels`)

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (err) {
      setError(`Import failed: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      // In a real implementation, you would fetch all labels from the database
      // For now, we'll just use mock data

      const mockData: EntityLabel[] = [
        {
          id: "1",
          address: "DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z",
          label: "Binance Hot Wallet",
          category: "exchange",
          confidence: 0.95,
          source: "community",
          createdAt: "2023-05-15T14:23:45Z",
          updatedAt: "2023-05-15T14:23:45Z",
          verified: true,
          riskScore: 10,
        },
        {
          id: "2",
          address: "5xoBq7f7CDgZwqHrDBdRWM84ExRetg4gZq93dyJtoSwp",
          label: "High Volume Trader",
          category: "individual",
          confidence: 0.75,
          source: "algorithm",
          createdAt: "2023-06-22T09:12:33Z",
          updatedAt: "2023-06-22T09:12:33Z",
          riskScore: 35,
        },
        {
          id: "3",
          address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
          label: "Suspicious Mixer",
          category: "mixer",
          confidence: 0.88,
          source: "user",
          createdAt: "2023-07-10T16:45:12Z",
          updatedAt: "2023-07-10T16:45:12Z",
          riskScore: 85,
          tags: ["high-risk", "mixer"],
        },
      ]

      setExportData(JSON.stringify(mockData, null, 2))
      setSuccess(`Successfully exported ${mockData.length} entity labels`)
    } catch (err) {
      setError(`Export failed: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!exportData) {
      setError("No data to download")
      return
    }

    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `entity-labels-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import & Export</CardTitle>
        <CardDescription>Import entity labels from JSON or export your current labels</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mt-4 border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Paste JSON data containing entity labels to import. The format should be an array of objects with the
                following properties:
              </p>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {`[
  {
    "address": "wallet_address",
    "label": "Entity Name",
    "category": "exchange|individual|contract|mixer|scam|other",
    "confidence": 0.9,
    "source": "user|community|algorithm|database",
    "tags": ["tag1", "tag2"],
    "notes": "Optional notes",
    "riskScore": 50,
    "verified": true
  }
]`}
              </pre>

              <Textarea
                placeholder="Paste JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={handleImport} disabled={isProcessing} className="w-full">
              {isProcessing ? "Processing..." : "Import Labels"}
            </Button>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <Button onClick={handleExport} disabled={isProcessing} variant="outline">
                {isProcessing ? "Processing..." : "Generate Export"}
              </Button>

              {exportData && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
              )}
            </div>

            {exportData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Export Preview</p>
                  <Badge variant="outline">{JSON.parse(exportData).length} Labels</Badge>
                </div>
                <Textarea value={exportData} readOnly rows={10} className="font-mono text-sm" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
