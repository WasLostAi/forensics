"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchEntityLabelsFromDB, saveEntityLabel, updateEntityLabel } from "@/lib/entity-service"
import type { EntityLabel } from "@/types/entity"
import { useToast } from "@/hooks/use-toast"

interface EntityLabelFormProps {
  entityId: string | null
  isOpen: boolean
  onClose: () => void
}

export function EntityLabelForm({ entityId, isOpen, onClose }: EntityLabelFormProps) {
  const [entity, setEntity] = useState<EntityLabel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    address: "",
    label: "",
    category: "exchange",
    confidence: 0.8,
    source: "user",
    notes: "",
    tags: "",
    riskScore: 50,
    verified: false,
  })

  // Load entity if editing
  useEffect(() => {
    if (entityId) {
      loadEntity(entityId)
    } else {
      resetForm()
    }
  }, [entityId])

  async function loadEntity(id: string) {
    setIsLoading(true)
    setError(null)
    try {
      const entities = await fetchEntityLabelsFromDB()
      const foundEntity = entities.find((e) => e.id === id)

      if (foundEntity) {
        setEntity(foundEntity)
        setFormData({
          address: foundEntity.address,
          label: foundEntity.label,
          category: foundEntity.category,
          confidence: foundEntity.confidence,
          source: foundEntity.source,
          notes: foundEntity.notes || "",
          tags: foundEntity.tags ? foundEntity.tags.join(", ") : "",
          riskScore: foundEntity.riskScore || 50,
          verified: foundEntity.verified || false,
        })
      } else {
        setError("Entity not found")
      }
    } catch (error) {
      console.error("Failed to load entity:", error)
      setError("Failed to load entity. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEntity(null)
    setFormData({
      address: "",
      label: "",
      category: "exchange",
      confidence: 0.8,
      source: "user",
      notes: "",
      tags: "",
      riskScore: 50,
      verified: false,
    })
    setError(null)
  }

  const handleSubmit = async () => {
    setError(null)

    if (!formData.address) {
      setError("Address is required")
      return
    }

    if (!formData.label) {
      setError("Label is required")
      return
    }

    setIsLoading(true)

    try {
      if (entity) {
        // Update existing entity
        await updateEntityLabel(entity.id, {
          label: formData.label,
          category: formData.category as any,
          confidence: formData.confidence,
          source: formData.source as any,
          notes: formData.notes,
          tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
          riskScore: formData.riskScore,
          verified: formData.verified,
        })

        toast({
          title: "Entity updated",
          description: `${formData.label} has been updated successfully.`,
        })
      } else {
        // Create new entity
        await saveEntityLabel({
          address: formData.address,
          label: formData.label,
          category: formData.category as any,
          confidence: formData.confidence,
          source: formData.source as any,
          notes: formData.notes,
          tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : undefined,
          riskScore: formData.riskScore,
          verified: formData.verified,
        })

        toast({
          title: "Entity created",
          description: `${formData.label} has been created successfully.`,
        })
      }

      onClose()
    } catch (error) {
      console.error("Failed to save entity:", error)
      setError("Failed to save entity. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>{entity ? "Edit Entity" : "Add New Entity"}</DialogTitle>
          <DialogDescription>
            {entity ? "Update information for this entity label." : "Add a new entity label to the database."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="col-span-3"
              placeholder="Solana wallet address"
              disabled={!!entity}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="col-span-3"
              placeholder="e.g., Binance Hot Wallet"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="col-span-3" id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exchange">Exchange</SelectItem>
                <SelectItem value="mixer">Mixer</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="scam">Scam</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confidence" className="text-right">
              Confidence
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              <Slider
                id="confidence"
                min={0}
                max={1}
                step={0.05}
                value={[formData.confidence]}
                onValueChange={(value) => setFormData({ ...formData, confidence: value[0] })}
                className="flex-1"
              />
              <span className="w-12 text-center">{(formData.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source" className="text-right">
              Source
            </Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger className="col-span-3" id="source">
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="algorithm">Algorithm</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="riskScore" className="text-right">
              Risk Score
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              <Slider
                id="riskScore"
                min={0}
                max={100}
                step={5}
                value={[formData.riskScore]}
                onValueChange={(value) => setFormData({ ...formData, riskScore: value[0] })}
                className="flex-1"
              />
              <span className="w-12 text-center">{formData.riskScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="col-span-3"
              placeholder="e.g., high-volume, exchange, verified (comma separated)"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="col-span-3"
              placeholder="Additional information about this entity"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="verified" className="text-right">
              Verified
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
              />
              <label
                htmlFor="verified"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as verified entity
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : entity ? "Update Entity" : "Add Entity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
