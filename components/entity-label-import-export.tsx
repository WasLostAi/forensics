"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, Check, Upload, Download, FileText, AlertTriangle } from "lucide-react"
import type { EntityLabel } from "@/types/entity"
import { getErrorMessage } from "@/lib/utils"

interface EntityLabelImportExportProps {
  labels: EntityLabel[]
  onImport: (labels: EntityLabel[]) => Promise<void>
}

export function EntityLabelImportExport({ labels, onImport }: EntityLabelImportExportProps) {
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<EntityLabel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      readFile(selectedFile)
    }
  }

  const readFile = (file: File) => {
    setError(null)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let parsed: EntityLabel[]

        if (file.name.endsWith(".json")) {
          parsed = JSON.parse(content)
        } else if (file.name.endsWith(".csv")) {
          parsed = parseCSV(content)
        } else {
          throw new Error("Unsupported file format. Please use JSON or CSV.")
        }

        // Validate the structure
        if (!Array.isArray(parsed)) {
          throw new Error("The file must contain an array of labels.")
        }

        // Basic validation of each item
        parsed.forEach((item, index) => {
          if (!item.name || !item.address || !item.category) {
            throw new Error(`Item at index ${index} is missing required fields (name, address, category).`)
          }
        })

        setPreviewData(parsed)
        setIsPreviewOpen(true)
      } catch (err) {
        setError(getErrorMessage(err))
      }
    }

    reader.onerror = () => {
      setError("Error reading file.")
    }

    if (file.name.endsWith(".json") || file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      setError("Unsupported file format. Please use JSON or CSV.")
    }
  }

  const parseCSV = (content: string): EntityLabel[] => {
    const lines = content.split("\n")
    if (lines.length < 2) {
      throw new Error("CSV file must have a header row and at least one data row.")
    }

    const header = lines[0].split(",").map((h) => h.trim())
    const requiredColumns = ["name", "address", "category"]

    requiredColumns.forEach((col) => {
      if (!header.includes(col)) {
        throw new Error(`CSV header must include ${col} column.`)
      }
    })

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line, index) => {
        const values = line.split(",").map((v) => v.trim())

        if (values.length !== header.length) {
          throw new Error(`Row ${index + 2} has ${values.length} columns but should have ${header.length}.`)
        }

        const item: Record<string, any> = {}

        header.forEach((col, i) => {
          if (col === "riskScore") {
            item[col] = Number.parseInt(values[i]) || 0
          } else if (col === "verified") {
            item[col] = values[i].toLowerCase() === "true"
          } else {
            item[col] = values[i]
          }
        })

        // Generate a unique ID if not provided
        if (!item.id) {
          item.id = `import-${Math.random().toString(36).substr(2, 9)}`
        }

        return item as EntityLabel
      })
  }

  const handleImport = async () => {
    if (previewData.length === 0) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onImport(previewData)
      setSuccess(`Successfully imported ${previewData.length} labels.`)
      setIsPreviewOpen(false)
      setIsImportOpen(false)
      setFile(null)
      setPreviewData([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (labels.length === 0) return

    const dataStr = JSON.stringify(labels, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `entity-labels-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleExportCSV = () => {
    if (labels.length === 0) return

    const header = ["id", "name", "address", "category", "description", "riskScore", "verified"].join(",")
    const rows = labels.map((label) => {
      return [
        label.id,
        label.name,
        label.address,
        label.category,
        label.description || "",
        label.riskScore || 0,
        label.verified || false,
      ].join(",")
    })

    const csv = [header, ...rows].join("\n")
    const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)

    const exportFileDefaultName = `entity-labels-${new Date().toISOString().slice(0, 10)}.csv`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Labels
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Entity Labels</DialogTitle>
              <DialogDescription>Upload a JSON or CSV file containing entity labels.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File (JSON or CSV)</Label>
                <Input id="file" ref={fileInputRef} type="file" accept=".json,.csv" onChange={handleFileChange} />
                <p className="text-sm text-muted-foreground">Supported formats: .json, .csv</p>
              </div>

              {file && (
                <div className="bg-muted p-3 rounded-md flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!file}
                onClick={() => {
                  if (file) {
                    readFile(file)
                  }
                }}
              >
                Preview Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Import Preview</DialogTitle>
              <DialogDescription>
                Review the data before importing. {previewData.length} labels will be imported.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-96 overflow-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Risk Score
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Verified
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-200">
                  {previewData.map((label, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{label.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">{label.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{label.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{label.riskScore || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{label.verified ? "Yes" : "No"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length > 10 && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                Showing all {previewData.length} labels. Scroll to see more.
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading ? "Importing..." : "Confirm Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={handleExport} disabled={labels.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>

        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={labels.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-800 p-3 rounded-md flex items-center space-x-2">
          <Check className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-1">Import Format Guide</h3>
        <p className="mb-2">Entity label data must include the following fields:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <code className="text-xs bg-muted px-1 rounded">name</code>: The entity name (required)
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">address</code>: Solana wallet address (required)
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">category</code>: Entity category (required)
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">description</code>: Optional description
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">riskScore</code>: Optional risk score (0-100)
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">verified</code>: Optional verification status (true/false)
          </li>
        </ul>
      </div>
    </div>
  )
}
