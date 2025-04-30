"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle } from "lucide-react"
import type { EntityLabel } from "@/types/entity"
import { getErrorMessage } from "@/lib/utils"

interface EntityLabelBulkOperationsProps {
  labels: EntityLabel[]
  onDelete: (ids: string[]) => Promise<void>
  onUpdateCategory: (ids: string[], category: string) => Promise<void>
  onUpdateVerified: (ids: string[], verified: boolean) => Promise<void>
  onUpdateRiskScore: (ids: string[], riskScore: number) => Promise<void>
}

export function EntityLabelBulkOperations({
  labels,
  onDelete,
  onUpdateCategory,
  onUpdateVerified,
  onUpdateRiskScore,
}: EntityLabelBulkOperationsProps) {
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [category, setCategory] = useState<string>("")
  const [verified, setVerified] = useState<boolean>(false)
  const [riskScore, setRiskScore] = useState<number>(0)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [operation, setOperation] = useState<"delete" | "updateCategory" | "updateVerified" | "updateRiskScore" | null>(
    null,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const categoryOptions = ["Exchange", "DeFi Protocol", "NFT Marketplace", "Wallet", "DAO", "Gaming", "Social", "Other"]

  const handleSelectLabel = (id: string) => {
    if (selectedLabelIds.includes(id)) {
      setSelectedLabelIds(selectedLabelIds.filter((labelId) => labelId !== id))
    } else {
      setSelectedLabelIds([...selectedLabelIds, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedLabelIds.length === labels.length) {
      setSelectedLabelIds([])
    } else {
      setSelectedLabelIds(labels.map((label) => label.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedLabelIds.length === 0) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onDelete(selectedLabelIds)
      setSuccess(`Successfully deleted ${selectedLabelIds.length} labels`)
      setSelectedLabelIds([])
      setIsOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdateCategory = async () => {
    if (selectedLabelIds.length === 0 || !category) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onUpdateCategory(selectedLabelIds, category)
      setSuccess(`Successfully updated category for ${selectedLabelIds.length} labels`)
      setIsOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdateVerified = async () => {
    if (selectedLabelIds.length === 0) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onUpdateVerified(selectedLabelIds, verified)
      setSuccess(`Successfully updated verification status for ${selectedLabelIds.length} labels`)
      setIsOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdateRiskScore = async () => {
    if (selectedLabelIds.length === 0) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onUpdateRiskScore(selectedLabelIds, riskScore)
      setSuccess(`Successfully updated risk score for ${selectedLabelIds.length} labels`)
      setIsOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (op: "delete" | "updateCategory" | "updateVerified" | "updateRiskScore") => {
    setOperation(op)
    setIsOpen(true)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedLabelIds.length === labels.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedLabelIds.length} of {labels.length} selected
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDialog("updateCategory")}
            disabled={selectedLabelIds.length === 0}
          >
            Update Category
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDialog("updateVerified")}
            disabled={selectedLabelIds.length === 0}
          >
            Update Verification
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDialog("updateRiskScore")}
            disabled={selectedLabelIds.length === 0}
          >
            Update Risk Score
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleOpenDialog("delete")}
            disabled={selectedLabelIds.length === 0}
          >
            Delete Selected
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Select
              </th>
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
                Verification
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Risk Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-gray-200">
            {labels.map((label) => (
              <tr
                key={label.id}
                className={`${selectedLabelIds.includes(label.id) ? "bg-muted/50" : ""}`}
                onClick={() => handleSelectLabel(label.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary-focus border-gray-300 rounded"
                      checked={selectedLabelIds.includes(label.id)}
                      onChange={() => handleSelectLabel(label.id)}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{label.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground truncate max-w-[150px]">{label.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline">{label.category}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {label.verified ? (
                    <Badge variant="success" className="bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-medium ${
                      label.riskScore > 75
                        ? "text-red-500"
                        : label.riskScore > 50
                          ? "text-orange-500"
                          : label.riskScore > 25
                            ? "text-yellow-500"
                            : "text-green-500"
                    }`}
                  >
                    {label.riskScore}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {operation === "delete" && "Delete Selected Labels"}
              {operation === "updateCategory" && "Update Category for Selected Labels"}
              {operation === "updateVerified" && "Update Verification Status"}
              {operation === "updateRiskScore" && "Update Risk Score"}
            </DialogTitle>
            <DialogDescription>
              {operation === "delete" &&
                `You are about to delete ${selectedLabelIds.length} labels. This action cannot be undone.`}
              {operation === "updateCategory" &&
                `You are about to update the category for ${selectedLabelIds.length} labels.`}
              {operation === "updateVerified" &&
                `You are about to update the verification status for ${selectedLabelIds.length} labels.`}
              {operation === "updateRiskScore" &&
                `You are about to update the risk score for ${selectedLabelIds.length} labels.`}
            </DialogDescription>
          </DialogHeader>

          {operation === "updateCategory" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {operation === "updateVerified" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="verified" checked={verified} onCheckedChange={setVerified} />
                <Label htmlFor="verified">Verified Status</Label>
              </div>
            </div>
          )}

          {operation === "updateRiskScore" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="riskScore">Risk Score (0-100)</Label>
                <Input
                  id="riskScore"
                  type="number"
                  min="0"
                  max="100"
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={operation === "delete" ? "destructive" : "default"}
              onClick={() => {
                if (operation === "delete") handleBulkDelete()
                if (operation === "updateCategory") handleBulkUpdateCategory()
                if (operation === "updateVerified") handleBulkUpdateVerified()
                if (operation === "updateRiskScore") handleBulkUpdateRiskScore()
              }}
              disabled={loading || (operation === "updateCategory" && !category)}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {success && (
        <div className="bg-green-50 text-green-800 p-3 rounded-md flex items-center space-x-2">
          <Check className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}
