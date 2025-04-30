"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, Share2 } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface ExportReportProps {
  walletAddress: string
  reportRef: React.RefObject<HTMLDivElement>
}

export function ExportReport({ walletAddress, reportRef }: ExportReportProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf")
  const [reportName, setReportName] = useState(`Solana Wallet Analysis - ${walletAddress.substring(0, 8)}`)
  const [includeWalletOverview, setIncludeWalletOverview] = useState(true)
  const [includeTransactionFlow, setIncludeTransactionFlow] = useState(true)
  const [includeFundingSources, setIncludeFundingSources] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [includeClusters, setIncludeClusters] = useState(true)
  const [includeEntityLabels, setIncludeEntityLabels] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!reportRef.current) return

    setIsExporting(true)

    try {
      if (exportFormat === "pdf") {
        // Export as PDF
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
        })

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
        pdf.save(`${reportName}.pdf`)
      } else {
        // Export as CSV
        // In a real implementation, this would extract data and format as CSV
        const csvContent = generateCsvContent(walletAddress)
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)

        link.setAttribute("href", url)
        link.setAttribute("download", `${reportName}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Mock function to generate CSV content
  const generateCsvContent = (address: string) => {
    return `Wallet Address,Transaction Count,Balance,Risk Score
${address},287,145.72,12
`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Export your analysis as a PDF report or CSV file.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pdf" onValueChange={(value) => setExportFormat(value as "pdf" | "csv")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF Report
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input id="report-name" value={reportName} onChange={(e) => setReportName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Include Sections</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wallet-overview"
                    checked={includeWalletOverview}
                    onCheckedChange={(checked) => setIncludeWalletOverview(checked as boolean)}
                  />
                  <Label htmlFor="wallet-overview">Wallet Overview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transaction-flow"
                    checked={includeTransactionFlow}
                    onCheckedChange={(checked) => setIncludeTransactionFlow(checked as boolean)}
                  />
                  <Label htmlFor="transaction-flow">Transaction Flow</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="funding-sources"
                    checked={includeFundingSources}
                    onCheckedChange={(checked) => setIncludeFundingSources(checked as boolean)}
                  />
                  <Label htmlFor="funding-sources">Funding Sources</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transactions"
                    checked={includeTransactions}
                    onCheckedChange={(checked) => setIncludeTransactions(checked as boolean)}
                  />
                  <Label htmlFor="transactions">Transactions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clusters"
                    checked={includeClusters}
                    onCheckedChange={(checked) => setIncludeClusters(checked as boolean)}
                  />
                  <Label htmlFor="clusters">Transaction Clusters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="entity-labels"
                    checked={includeEntityLabels}
                    onCheckedChange={(checked) => setIncludeEntityLabels(checked as boolean)}
                  />
                  <Label htmlFor="entity-labels">Entity Labels</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="csv-name">File Name</Label>
              <Input id="csv-name" value={reportName} onChange={(e) => setReportName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Include Data</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csv-wallet-overview"
                    checked={includeWalletOverview}
                    onCheckedChange={(checked) => setIncludeWalletOverview(checked as boolean)}
                  />
                  <Label htmlFor="csv-wallet-overview">Wallet Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csv-transactions"
                    checked={includeTransactions}
                    onCheckedChange={(checked) => setIncludeTransactions(checked as boolean)}
                  />
                  <Label htmlFor="csv-transactions">Transactions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csv-funding-sources"
                    checked={includeFundingSources}
                    onCheckedChange={(checked) => setIncludeFundingSources(checked as boolean)}
                  />
                  <Label htmlFor="csv-funding-sources">Funding Sources</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csv-entity-labels"
                    checked={includeEntityLabels}
                    onCheckedChange={(checked) => setIncludeEntityLabels(checked as boolean)}
                  />
                  <Label htmlFor="csv-entity-labels">Entity Labels</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" type="button">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
