"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, AlertTriangle } from "lucide-react"
import { fetchEntityLabelsFromDB } from "@/lib/entity-service"
import { lookupEntity } from "@/lib/entity-database"
import type { EntityLabel } from "@/types/entity"
import { EntityLabelManagement } from "@/components/entity-label-management"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EntityLabelsProps {
  walletAddress: string
}

export function EntityLabels({ walletAddress }: EntityLabelsProps) {
  const [labels, setLabels] = useState<EntityLabel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isManagementOpen, setIsManagementOpen] = useState(false)

  useEffect(() => {
    loadLabels()
  }, [walletAddress])

  async function loadLabels() {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch entity labels from Supabase
      const data = await fetchEntityLabelsFromDB(walletAddress)

      // Check if this wallet is in our known entities database
      const knownEntity = lookupEntity(walletAddress)

      if (knownEntity && !data.some((label) => label.source === "database" && label.label === knownEntity.name)) {
        // Add the known entity as a label if it doesn't exist yet
        const knownEntityLabel: EntityLabel = {
          id: "known-entity",
          address: walletAddress,
          label: knownEntity.name,
          category: knownEntity.category as any,
          confidence: 1.0,
          source: "database",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setLabels([knownEntityLabel, ...data])
      } else {
        setLabels(data)
      }
    } catch (error) {
      console.error("Failed to load entity labels:", error)
      setError("Failed to load entity labels. Using demonstration data.")

      // Mock data for demo purposes
      const mockLabels: EntityLabel[] = [
        {
          id: "1",
          address: walletAddress,
          label: "Binance Hot Wallet",
          category: "exchange",
          confidence: 0.95,
          source: "community",
          createdAt: "2023-05-15T14:23:45Z",
          updatedAt: "2023-05-15T14:23:45Z",
        },
        {
          id: "2",
          address: walletAddress,
          label: "High Volume Trader",
          category: "individual",
          confidence: 0.75,
          source: "algorithm",
          createdAt: "2023-06-22T09:12:33Z",
          updatedAt: "2023-06-22T09:12:33Z",
        },
      ]

      setLabels(mockLabels)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exchange":
        return "bg-blue-500"
      case "individual":
        return "bg-green-500"
      case "contract":
        return "bg-purple-500"
      case "mixer":
        return "bg-yellow-500"
      case "scam":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Entity Labels</h2>
        <Button onClick={() => setIsManagementOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Manage Labels
        </Button>
      </div>

      <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-secondary/20 backdrop-blur-sm">
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading entity labels...
                </TableCell>
              </TableRow>
            ) : labels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No entity labels found.
                </TableCell>
              </TableRow>
            ) : (
              labels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell className="font-medium">{label.label}</TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryColor(label.category)} text-white`}>{label.category}</Badge>
                  </TableCell>
                  <TableCell>{(label.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell>{label.source}</TableCell>
                  <TableCell>{new Date(label.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Entity Label Management Dialog */}
      <Dialog open={isManagementOpen} onOpenChange={setIsManagementOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>Manage Entity Labels</DialogTitle>
          </DialogHeader>
          <EntityLabelManagement
            walletAddress={walletAddress}
            onLabelsChange={() => {
              loadLabels()
              setIsManagementOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
