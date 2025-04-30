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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, FileIcon as FilePdf, FileJson, FileSpreadsheet, Share, Save, Check } from "lucide-react"

interface ExportOptions {
  includeTransactions: boolean
  includeAddresses: boolean
  includeRiskScores: boolean
  includeEntityLabels: boolean
  includeFlowVisualizations: boolean
  transactionLimit: number
  format: "pdf" | "json" | "csv" | "xlsx"
  dateRange: "all" | "7d" | "30d" | "90d" | "custom"
  customStartDate?: string
  customEndDate?: string
}

interface ReportMetadata {
  title: string
  description: string
  author: string
  caseReference?: string
  tags: string[]
}

export function ExportReport() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [options, setOptions] = useState<ExportOptions>({
    includeTransactions: true,
    includeAddresses: true,
    includeRiskScores: true,
    includeEntityLabels: true,
    includeFlowVisualizations: true,
    transactionLimit: 1000,
    format: "pdf",
    dateRange: "all",
  })
  const [metadata, setMetadata] = useState<ReportMetadata>({
    title: "",
    description: "",
    author: "",
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [exportURL, setExportURL] = useState("")

  const handleExport = async () => {
    setLoading(true)

    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would make an API call to generate the report
      // and return a download URL or blob

      setSuccess(true)
      setExportURL(`/reports/report-${Date.now()}.${getFileExtension(options.format)}`)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFileExtension = (format: string) => {
    switch (format) {
      case "pdf":
        return "pdf"
      case "json":
        return "json"
      case "csv":
        return "csv"
      case "xlsx":
        return "xlsx"
      default:
        return "pdf"
    }
  }

  const addTag = () => {
    if (tagInput && !metadata.tags.includes(tagInput)) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter((t) => t !== tag),
    })
  }

  const getFormatIcon = () => {
    switch (options.format) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "json":
        return <FileJson className="h-5 w-5 text-blue-500" />
      case "csv":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5 text-green-700" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const resetDialog = () => {
    setStep(1)
    setSuccess(false)
    setExportURL("")
    setOptions({
      includeTransactions: true,
      includeAddresses: true,
      includeRiskScores: true,
      includeEntityLabels: true,
      includeFlowVisualizations: true,
      transactionLimit: 1000,
      format: "pdf",
      dateRange: "all",
    })
    setMetadata({
      title: "",
      description: "",
      author: "",
      tags: [],
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Investigation Report</DialogTitle>
          <DialogDescription>Generate a comprehensive report of your forensic analysis.</DialogDescription>
        </DialogHeader>

        {!success ? (
          <>
            <div className="flex justify-between mb-6">
              <div className="flex space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  1
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  2
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  3
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Step {step} of 3</div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Report Settings</h3>

                <Tabs defaultValue="content">
                  <TabsList className="mb-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="format">Format</TabsTrigger>
                    <TabsTrigger value="timeframe">Timeframe</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-transactions"
                          checked={options.includeTransactions}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeTransactions: checked === true })
                          }
                        />
                        <Label htmlFor="include-transactions">Transactions</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-addresses"
                          checked={options.includeAddresses}
                          onCheckedChange={(checked) => setOptions({ ...options, includeAddresses: checked === true })}
                        />
                        <Label htmlFor="include-addresses">Addresses</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-risk-scores"
                          checked={options.includeRiskScores}
                          onCheckedChange={(checked) => setOptions({ ...options, includeRiskScores: checked === true })}
                        />
                        <Label htmlFor="include-risk-scores">Risk Scores</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-entity-labels"
                          checked={options.includeEntityLabels}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeEntityLabels: checked === true })
                          }
                        />
                        <Label htmlFor="include-entity-labels">Entity Labels</Label>
                      </div>

                      <div className="flex items-center space-x-2 col-span-2">
                        <Checkbox
                          id="include-flow-visualizations"
                          checked={options.includeFlowVisualizations}
                          onCheckedChange={(checked) =>
                            setOptions({ ...options, includeFlowVisualizations: checked === true })
                          }
                        />
                        <Label htmlFor="include-flow-visualizations">Flow Visualizations</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="transaction-limit">Transaction Limit: {options.transactionLimit}</Label>
                        <span className="text-sm text-muted-foreground">
                          {options.transactionLimit.toLocaleString()} transactions
                        </span>
                      </div>
                      <Slider
                        id="transaction-limit"
                        min={100}
                        max={10000}
                        step={100}
                        value={[options.transactionLimit]}
                        onValueChange={(value) => setOptions({ ...options, transactionLimit: value[0] })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="format" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Report Format</Label>
                      <Select
                        value={options.format}
                        onValueChange={(value: "pdf" | "json" | "csv" | "xlsx") =>
                          setOptions({ ...options, format: value })
                        }
                      >
                        <SelectTrigger id="format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="json">JSON Data</SelectItem>
                          <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                          <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFormatIcon()}
                        <div>
                          <h4 className="text-sm font-medium">
                            {options.format === "pdf" && "PDF Document"}
                            {options.format === "json" && "JSON Data Export"}
                            {options.format === "csv" && "CSV Spreadsheet"}
                            {options.format === "xlsx" && "Excel Spreadsheet"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {options.format === "pdf" && "Comprehensive report with visualizations and analysis"}
                            {options.format === "json" && "Raw data export for programmatic analysis"}
                            {options.format === "csv" && "Tabular data for spreadsheet analysis"}
                            {options.format === "xlsx" && "Rich spreadsheet with multiple data tabs"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeframe" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-range">Date Range</Label>
                      <Select
                        value={options.dateRange}
                        onValueChange={(value: "all" | "7d" | "30d" | "90d" | "custom") =>
                          setOptions({ ...options, dateRange: value })
                        }
                      >
                        <SelectTrigger id="date-range">
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                          <SelectItem value="90d">Last 90 Days</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {options.dateRange === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={options.customStartDate}
                            onChange={(e) => setOptions({ ...options, customStartDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={options.customEndDate}
                            onChange={(e) => setOptions({ ...options, customEndDate: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Report Metadata</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter report title"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter report description"
                      value={metadata.description}
                      onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        placeholder="Your name"
                        value={metadata.author}
                        onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="case-reference">Case Reference (Optional)</Label>
                      <Input
                        id="case-reference"
                        placeholder="Case ID or reference"
                        value={metadata.caseReference}
                        onChange={(e) => setMetadata({ ...metadata, caseReference: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button variant="outline" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metadata.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="bg-muted text-muted-foreground text-sm rounded-full px-3 py-1 flex items-center"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review & Export</h3>

                <div className="rounded-md border p-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Report Content</h4>
                    <div className="text-sm">
                      {options.includeTransactions && (
                        <div className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Transactions
                        </div>
                      )}
                      {options.includeAddresses && (
                        <div className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Addresses
                        </div>
                      )}
                      {options.includeRiskScores && (
                        <div className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Risk Scores
                        </div>
                      )}
                      {options.includeEntityLabels && (
                        <div className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Entity Labels
                        </div>
                      )}
                      {options.includeFlowVisualizations && (
                        <div className="flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Flow Visualizations
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Format:</span>{" "}
                      <span className="font-medium">
                        {options.format === "pdf" && "PDF Document"}
                        {options.format === "json" && "JSON Data"}
                        {options.format === "csv" && "CSV Spreadsheet"}
                        {options.format === "xlsx" && "Excel Spreadsheet"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transactions:</span>{" "}
                      <span className="font-medium">Up to {options.transactionLimit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Timeframe:</span>{" "}
                      <span className="font-medium">
                        {options.dateRange === "all" && "All Time"}
                        {options.dateRange === "7d" && "Last 7 Days"}
                        {options.dateRange === "30d" && "Last 30 Days"}
                        {options.dateRange === "90d" && "Last 90 Days"}
                        {options.dateRange === "custom" && `${options.customStartDate} to ${options.customEndDate}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 space-y-2">
                  <h4 className="text-sm font-semibold">Report Information</h4>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Title:</span>{" "}
                      <span className="font-medium">{metadata.title || "[Not specified]"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Author:</span>{" "}
                      <span className="font-medium">{metadata.author || "[Not specified]"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Description:</span>{" "}
                      <span>{metadata.description || "[Not specified]"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Case Reference:</span>{" "}
                      <span>{metadata.caseReference || "[None]"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tags:</span>{" "}
                      <span>{metadata.tags.length > 0 ? metadata.tags.join(", ") : "[None]"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="share-report" checked={false} />
                  <Label htmlFor="share-report">Save report to shared workspace</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>Continue</Button>
              ) : (
                <Button onClick={handleExport} disabled={loading}>
                  {loading ? "Generating Report..." : "Export Report"}
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center">Report Generated Successfully</h3>
              <p className="text-center text-muted-foreground mt-2">Your report is ready for download</p>
            </div>

            <div className="flex justify-center">
              <Button asChild>
                <a href={exportURL} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </a>
              </Button>
            </div>

            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getFormatIcon()}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">{metadata.title || "Investigation Report"}</h4>
                    <p className="text-xs text-muted-foreground">
                      {options.format.toUpperCase()} • Generated on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Share className="h-3.5 w-3.5 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
