"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Download,
  Search,
  MoreHorizontal,
  Plus,
  Calendar,
  User,
  FileBarChart,
  Share2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
} from "lucide-react"

interface Report {
  id: string
  title: string
  type: "wallet_analysis" | "transaction_flow" | "risk_assessment" | "entity_analysis" | "custom"
  createdAt: string
  createdBy: string
  status: "completed" | "in_progress" | "scheduled" | "failed"
  format: "pdf" | "csv" | "json"
  size?: string
  downloadUrl?: string
  walletAddress?: string
  description?: string
  tags?: string[]
}

export function ReportsView() {
  const [activeTab, setActiveTab] = useState("all")
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [newReportTitle, setNewReportTitle] = useState("")
  const [newReportType, setNewReportType] = useState<Report["type"]>("wallet_analysis")
  const [newReportWallet, setNewReportWallet] = useState("")
  const [newReportDescription, setNewReportDescription] = useState("")
  const [selectedSections, setSelectedSections] = useState({
    overview: true,
    transactions: true,
    riskAnalysis: true,
    entityLabels: true,
    flowVisualization: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationSuccess, setGenerationSuccess] = useState(false)

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true)
      setError(null)
      try {
        // In a real implementation, this would fetch from your database
        // For now, we'll use mock data
        const mockReports: Report[] = [
          {
            id: "rep-001",
            title: "Wallet Analysis - 8ZUczUAUSZvMQdpiNPWWxwRdvDUduVvJo7MxJqDzsZcz",
            type: "wallet_analysis",
            createdAt: "2023-11-28T14:32:21Z",
            createdBy: "Alex Johnson",
            status: "completed",
            format: "pdf",
            size: "2.4 MB",
            downloadUrl: "#",
            walletAddress: "8ZUczUAUSZvMQdpiNPWWxwRdvDUduVvJo7MxJqDzsZcz",
            tags: ["high-risk", "exchange"],
          },
          {
            id: "rep-002",
            title: "Transaction Flow Analysis",
            type: "transaction_flow",
            createdAt: "2023-11-27T09:15:43Z",
            createdBy: "Maria Garcia",
            status: "completed",
            format: "pdf",
            size: "3.1 MB",
            downloadUrl: "#",
            walletAddress: "5xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9",
            description: "Analysis of fund movements between related wallets",
            tags: ["mixer", "investigation"],
          },
          {
            id: "rep-003",
            title: "Risk Assessment Report - November 2023",
            type: "risk_assessment",
            createdAt: "2023-11-25T16:42:11Z",
            createdBy: "Sam Wilson",
            status: "in_progress",
            format: "pdf",
            description: "Monthly risk assessment of monitored wallets",
          },
          {
            id: "rep-004",
            title: "Entity Analysis - DEX Interactions",
            type: "entity_analysis",
            createdAt: "2023-11-24T10:11:32Z",
            createdBy: "Alex Johnson",
            status: "scheduled",
            format: "csv",
            description: "Analysis of interactions with decentralized exchanges",
          },
          {
            id: "rep-005",
            title: "Custom Investigation Report",
            type: "custom",
            createdAt: "2023-11-23T15:27:19Z",
            createdBy: "Maria Garcia",
            status: "failed",
            format: "json",
            description: "Custom investigation of suspicious transaction patterns",
          },
        ]

        setReports(mockReports)
      } catch (err) {
        console.error("Failed to load reports:", err)
        setError("Failed to load reports. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [])

  const handleGenerateReport = async () => {
    if (!newReportTitle.trim() || !newReportType) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationSuccess(false)

    try {
      // Simulate report generation with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // Add the new report to the list
      const newReport: Report = {
        id: `rep-${Date.now()}`,
        title: newReportTitle,
        type: newReportType,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
        status: "completed",
        format: "pdf",
        size: "1.8 MB",
        downloadUrl: "#",
        walletAddress: newReportWallet,
        description: newReportDescription,
        tags: ["new"],
      }

      setReports([newReport, ...reports])
      setGenerationSuccess(true)

      // Reset form
      setNewReportTitle("")
      setNewReportType("wallet_analysis")
      setNewReportWallet("")
      setNewReportDescription("")
    } catch (err) {
      console.error("Failed to generate report:", err)
      setError("Failed to generate report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((report) => report.id !== reportId))
  }

  const filteredReports = reports.filter((report) => {
    // Filter by search query
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    if (activeTab === "completed") return matchesSearch && report.status === "completed"
    if (activeTab === "in_progress")
      return matchesSearch && (report.status === "in_progress" || report.status === "scheduled")
    if (activeTab === "failed") return matchesSearch && report.status === "failed"

    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "in_progress":
      case "scheduled":
        return "warning"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "wallet_analysis":
        return <User className="h-4 w-4" />
      case "transaction_flow":
        return <FileBarChart className="h-4 w-4" />
      case "risk_assessment":
        return <AlertTriangle className="h-4 w-4" />
      case "entity_analysis":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            Sort
          </Button>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 ml-auto">
                <Plus className="h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>Create a new forensic analysis report with customized content.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter report title"
                    value={newReportTitle}
                    onChange={(e) => setNewReportTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Report Type</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={newReportType}
                    onChange={(e) => setNewReportType(e.target.value as Report["type"])}
                  >
                    <option value="wallet_analysis">Wallet Analysis</option>
                    <option value="transaction_flow">Transaction Flow</option>
                    <option value="risk_assessment">Risk Assessment</option>
                    <option value="entity_analysis">Entity Analysis</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address (optional)</Label>
                  <Input
                    id="wallet"
                    placeholder="Enter wallet address"
                    value={newReportWallet}
                    onChange={(e) => setNewReportWallet(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Enter report description"
                    value={newReportDescription}
                    onChange={(e) => setNewReportDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Include Sections</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overview"
                        checked={selectedSections.overview}
                        onCheckedChange={(checked) => setSelectedSections({ ...selectedSections, overview: !!checked })}
                      />
                      <Label htmlFor="overview">Wallet Overview</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="transactions"
                        checked={selectedSections.transactions}
                        onCheckedChange={(checked) =>
                          setSelectedSections({ ...selectedSections, transactions: !!checked })
                        }
                      />
                      <Label htmlFor="transactions">Transaction History</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="riskAnalysis"
                        checked={selectedSections.riskAnalysis}
                        onCheckedChange={(checked) =>
                          setSelectedSections({ ...selectedSections, riskAnalysis: !!checked })
                        }
                      />
                      <Label htmlFor="riskAnalysis">Risk Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="entityLabels"
                        checked={selectedSections.entityLabels}
                        onCheckedChange={(checked) =>
                          setSelectedSections({ ...selectedSections, entityLabels: !!checked })
                        }
                      />
                      <Label htmlFor="entityLabels">Entity Labels</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="flowVisualization"
                        checked={selectedSections.flowVisualization}
                        onCheckedChange={(checked) =>
                          setSelectedSections({ ...selectedSections, flowVisualization: !!checked })
                        }
                      />
                      <Label htmlFor="flowVisualization">Flow Visualization</Label>
                    </div>
                  </div>
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <Label>Generating Report</Label>
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {generationProgress < 100 ? `Processing... ${generationProgress}%` : "Finalizing report..."}
                    </p>
                  </div>
                )}

                {generationSuccess && (
                  <Alert variant="success" className="bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>Report generated successfully!</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport} disabled={isGenerating || !newReportTitle.trim()}>
                  {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No reports found</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  {searchQuery
                    ? "No reports match your search criteria. Try adjusting your search."
                    : "You haven't generated any reports yet. Click 'Generate Report' to create one."}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => setShowGenerateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Your First Report
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">{getReportTypeIcon(report.type)}</div>
                          <div>
                            <h3 className="font-medium">{report.title}</h3>
                            {report.description && (
                              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant={getStatusBadgeVariant(report.status)}>
                                {report.status === "in_progress"
                                  ? "In Progress"
                                  : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Badge>
                              <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                              {report.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.status === "completed" && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          )}
                          {report.status === "completed" && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {report.status === "completed" && (
                                <>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Report
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(report.status === "in_progress" || report.status === "scheduled") && (
                                <DropdownMenuItem>Cancel Generation</DropdownMenuItem>
                              )}
                              {report.status === "failed" && <DropdownMenuItem>Retry Generation</DropdownMenuItem>}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteReport(report.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="border-t px-6 py-3 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Created: {formatDate(report.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>By: {report.createdBy}</span>
                        </div>
                      </div>
                      {report.size && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Size: {report.size}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
