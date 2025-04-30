"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileJson, FileText, Table, Share2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExportReportProps {
  walletAddress: string
  transactionData: any
  flowData: any
  entityData: any
  riskData: any
}

export function ExportReport({ walletAddress, transactionData, flowData, entityData, riskData }: ExportReportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf">("json")
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [selectedSections, setSelectedSections] = useState({
    transactions: true,
    flow: true,
    entities: true,
    risk: true,
  })

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      // Prepare the data to export based on selected sections
      const exportData: any = {
        walletAddress,
        exportDate: new Date().toISOString(),
      }

      if (selectedSections.transactions) {
        exportData.transactions = transactionData
      }

      if (selectedSections.flow) {
        exportData.flow = flowData
      }

      if (selectedSections.entities) {
        exportData.entities = entityData
      }

      if (selectedSections.risk) {
        exportData.risk = riskData
      }

      // Export based on selected format
      if (exportFormat === "json") {
        await exportAsJson(exportData)
      } else if (exportFormat === "csv") {
        await exportAsCsv(exportData)
      } else if (exportFormat === "pdf") {
        await exportAsPdf(exportData)
      }

      setExportSuccess(true)
    } catch (error) {
      console.error("Export failed:", error)
      setExportError("Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsJson = async (data: any) => {
    // Create a JSON blob and download it
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wallet-analysis-${walletAddress.substring(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsCsv = async (data: any) => {
    // This is a simplified implementation
    // In a real app, you would convert the data to CSV format
    alert("CSV export not implemented yet")
  }

  const exportAsPdf = async (data: any) => {
    // This is a simplified implementation
    // In a real app, you would generate a PDF
    alert("PDF export not implemented yet")
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Export Report
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Analysis Report</DialogTitle>
            <DialogDescription>
              Export your wallet analysis data in various formats for offline use or sharing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Include Sections</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transactions"
                    checked={selectedSections.transactions}
                    onCheckedChange={(checked) => setSelectedSections({ ...selectedSections, transactions: !!checked })}
                  />
                  <Label htmlFor="transactions">Transaction History</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flow"
                    checked={selectedSections.flow}
                    onCheckedChange={(checked) => setSelectedSections({ ...selectedSections, flow: !!checked })}
                  />
                  <Label htmlFor="flow">Transaction Flow</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="entities"
                    checked={selectedSections.entities}
                    onCheckedChange={(checked) => setSelectedSections({ ...selectedSections, entities: !!checked })}
                  />
                  <Label htmlFor="entities">Entity Labels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="risk"
                    checked={selectedSections.risk}
                    onCheckedChange={(checked) => setSelectedSections({ ...selectedSections, risk: !!checked })}
                  />
                  <Label htmlFor="risk">Risk Analysis</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export Format</h3>
              <RadioGroup
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as "json" | "csv" | "pdf")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON (Complete data)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV (Spreadsheet-friendly)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {exportError && (
              <Alert variant="destructive">
                <AlertDescription>{exportError}</AlertDescription>
              </Alert>
            )}

            {exportSuccess && (
              <Alert variant="success">
                <AlertDescription>Export completed successfully!</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
