"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Calendar, Edit, FileText, Link, Plus, Search, Share, Tag, Trash, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getErrorMessage } from "@/lib/utils"

// Define interface for investigation objects
interface Investigation {
  id: string
  title: string
  description: string
  status: "active" | "archived" | "completed"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  addresses: string[]
  tags: string[]
  transactions: string[]
  collaborators?: string[]
}

interface CollaboratorInfo {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface InvestigationManagementProps {
  initialInvestigations?: Investigation[]
  collaborators?: CollaboratorInfo[]
  onCreateInvestigation?: (investigation: Omit<Investigation, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onUpdateInvestigation?: (id: string, investigation: Partial<Investigation>) => Promise<void>
  onDeleteInvestigation?: (id: string) => Promise<void>
  onAddCollaborator?: (investigationId: string, collaboratorId: string) => Promise<void>
  onRemoveCollaborator?: (investigationId: string, collaboratorId: string) => Promise<void>
}

export function InvestigationManagement({
  initialInvestigations = [],
  collaborators = [],
  onCreateInvestigation,
  onUpdateInvestigation,
  onDeleteInvestigation,
  onAddCollaborator,
  onRemoveCollaborator,
}: InvestigationManagementProps) {
  const [investigations, setInvestigations] = useState<Investigation[]>(initialInvestigations)
  const [filteredInvestigations, setFilteredInvestigations] = useState<Investigation[]>(initialInvestigations)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"active" | "archived" | "completed">("active")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [addresses, setAddresses] = useState<string[]>([])
  const [addressInput, setAddressInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [transactions, setTransactions] = useState<string[]>([])
  const [transactionInput, setTransactionInput] = useState("")
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([])
  const [currentCollaborator, setCurrentCollaborator] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInvestigations(initialInvestigations)
  }, [initialInvestigations])

  useEffect(() => {
    let filtered = [...investigations]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (investigation) =>
          investigation.title.toLowerCase().includes(query) ||
          investigation.description.toLowerCase().includes(query) ||
          investigation.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          investigation.addresses.some((address) => address.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((investigation) => investigation.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter((investigation) => investigation.priority === priorityFilter)
    }

    setFilteredInvestigations(filtered)
  }, [investigations, searchQuery, statusFilter, priorityFilter])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("active")
    setPriority("medium")
    setAddresses([])
    setAddressInput("")
    setTags([])
    setTagInput("")
    setTransactions([])
    setTransactionInput("")
    setSelectedCollaborators([])
    setCurrentCollaborator("")
    setError(null)
  }

  const handleCreateInvestigation = async () => {
    if (!title) {
      setError("Title is required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newInvestigation: Omit<Investigation, "id" | "createdAt" | "updatedAt"> = {
        title,
        description,
        status,
        priority,
        addresses,
        tags,
        transactions,
        collaborators: selectedCollaborators,
      }

      if (onCreateInvestigation) {
        await onCreateInvestigation(newInvestigation)
      } else {
        const now = new Date().toISOString()
        const createdInvestigation: Investigation = {
          ...newInvestigation,
          id: `local-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        }
        setInvestigations([...investigations, createdInvestigation])
      }
      resetForm()
      setIsCreateDialogOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInvestigation = async () => {
    if (!currentInvestigation || !title) {
      setError("Title is required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updatedInvestigation: Partial<Investigation> = {
        title,
        description,
        status,
        priority,
        addresses,
        tags,
        transactions,
        collaborators: selectedCollaborators,
        updatedAt: new Date().toISOString(),
      }

      if (onUpdateInvestigation) {
        await onUpdateInvestigation(currentInvestigation.id, updatedInvestigation)
      } else {
        setInvestigations(
          investigations.map((inv) => (inv.id === currentInvestigation.id ? { ...inv, ...updatedInvestigation } : inv)),
        )
      }
      resetForm()
      setIsEditDialogOpen(false)
      setCurrentInvestigation(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInvestigation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this investigation? This action cannot be undone.")) {
      try {
        if (onDeleteInvestigation) {
          await onDeleteInvestigation(id)
        } else {
          setInvestigations(investigations.filter((inv) => inv.id !== id))
        }
      } catch (err) {
        console.error("Error deleting investigation:", err)
        alert(`Error deleting investigation: ${getErrorMessage(err)}`)
      }
    }
  }

  const handleEditClick = (investigation: Investigation) => {
    setCurrentInvestigation(investigation)
    setTitle(investigation.title)
    setDescription(investigation.description)
    setStatus(investigation.status)
    setPriority(investigation.priority)
    setAddresses(investigation.addresses || [])
    setTags(investigation.tags || [])
    setTransactions(investigation.transactions || [])
    setSelectedCollaborators(investigation.collaborators || [])
    setIsEditDialogOpen(true)
  }

  const handleShareClick = (investigation: Investigation) => {
    setCurrentInvestigation(investigation)
    setSelectedCollaborators(investigation.collaborators || [])
    setIsShareDialogOpen(true)
  }

  const handleAddCollaborator = async () => {
    if (!currentInvestigation) return

    // Don't require currentCollaborator to be set
    if (!currentCollaborator) {
      // If no collaborator is selected, just show a message
      alert("Please select a collaborator to add")
      return
    }

    try {
      if (onAddCollaborator) {
        await onAddCollaborator(currentInvestigation.id, currentCollaborator)
      } else {
        const updatedCollaborators = [...(currentInvestigation.collaborators || []), currentCollaborator]
        setInvestigations(
          investigations.map((inv) =>
            inv.id === currentInvestigation.id ? { ...inv, collaborators: updatedCollaborators } : inv,
          ),
        )
        setSelectedCollaborators(updatedCollaborators)
      }
      setCurrentCollaborator("")
    } catch (err) {
      console.error("Error adding collaborator:", err)
      alert(`Error adding collaborator: ${getErrorMessage(err)}`)
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!currentInvestigation) return

    try {
      if (onRemoveCollaborator) {
        await onRemoveCollaborator(currentInvestigation.id, collaboratorId)
      } else {
        const updatedCollaborators = (currentInvestigation.collaborators || []).filter((id) => id !== collaboratorId)
        setInvestigations(
          investigations.map((inv) =>
            inv.id === currentInvestigation.id ? { ...inv, collaborators: updatedCollaborators } : inv,
          ),
        )
        setSelectedCollaborators(updatedCollaborators)
      }
    } catch (err) {
      console.error("Error removing collaborator:", err)
      alert(`Error removing collaborator: ${getErrorMessage(err)}`)
    }
  }

  const addAddress = () => {
    if (addressInput && !addresses.includes(addressInput)) {
      setAddresses([...addresses, addressInput])
      setAddressInput("")
    }
  }

  const removeAddress = (address: string) => {
    setAddresses(addresses.filter((a) => a !== address))
  }

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addTransaction = () => {
    if (transactionInput && !transactions.includes(transactionInput)) {
      setTransactions([...transactions, transactionInput])
      setTransactionInput("")
    }
  }

  const removeTransaction = (transaction: string) => {
    setTransactions(transactions.filter((t) => t !== transaction))
  }

  const getCollaboratorName = (id: string) => {
    const collaborator = collaborators.find((c) => c.id === id)
    return collaborator ? collaborator.name : "Unknown User"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50"
      case "medium":
        return "text-orange-500 bg-orange-50"
      case "low":
        return "text-green-500 bg-green-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-blue-500 bg-blue-50"
      case "completed":
        return "text-green-500 bg-green-50"
      case "archived":
        return "text-gray-500 bg-gray-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search investigations..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Investigation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Investigation</DialogTitle>
              <DialogDescription>Start a new investigation by providing key details.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Investigation title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value: "active" | "archived" | "completed") => setStatus(value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="addresses" className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter wallet address"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addAddress()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addAddress}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {addresses.map((address, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {address.substring(0, 8)}...{address.substring(address.length - 4)}
                      <button
                        onClick={() => removeAddress(address)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {addresses.length === 0 && <p className="text-sm text-muted-foreground">No addresses added yet.</p>}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter transaction signature"
                    value={transactionInput}
                    onChange={(e) => setTransactionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTransaction()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addTransaction}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {transactions.map((transaction, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {transaction.substring(0, 8)}...{transaction.substring(transaction.length - 4)}
                      <button
                        onClick={() => removeTransaction(transaction)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No transactions added yet.</p>
                )}
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                <div className="flex space-x-2">
                  <Input
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
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags added yet.</p>}
              </TabsContent>

              <TabsContent value="collaborators" className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={currentCollaborator} onValueChange={setCurrentCollaborator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collaborator" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleAddCollaborator} disabled={!currentCollaborator}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCollaborators.map((id) => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {getCollaboratorName(id)}
                      <button
                        onClick={() => handleRemoveCollaborator(id)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {selectedCollaborators.length === 0 && (
                  <p className="text-sm text-muted-foreground">No collaborators added yet.</p>
                )}
              </TabsContent>
            </Tabs>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsCreateDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateInvestigation} disabled={loading}>
                {loading ? "Creating..." : "Create Investigation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Investigation</DialogTitle>
              <DialogDescription>Update the investigation details.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Investigation title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value: "active" | "archived" | "completed") => setStatus(value)}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                      <SelectTrigger id="edit-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* The rest of the tabs are the same as in Create Dialog */}
              <TabsContent value="addresses" className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter wallet address"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addAddress()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addAddress}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {addresses.map((address, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {address.substring(0, 8)}...{address.substring(address.length - 4)}
                      <button
                        onClick={() => removeAddress(address)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {addresses.length === 0 && <p className="text-sm text-muted-foreground">No addresses added yet.</p>}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter transaction signature"
                    value={transactionInput}
                    onChange={(e) => setTransactionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTransaction()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addTransaction}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {transactions.map((transaction, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {transaction.substring(0, 8)}...{transaction.substring(transaction.length - 4)}
                      <button
                        onClick={() => removeTransaction(transaction)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No transactions added yet.</p>
                )}
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                <div className="flex space-x-2">
                  <Input
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
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags added yet.</p>}
              </TabsContent>

              <TabsContent value="collaborators" className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={currentCollaborator} onValueChange={setCurrentCollaborator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collaborator" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleAddCollaborator} disabled={!currentCollaborator}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCollaborators.map((id) => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {getCollaboratorName(id)}
                      <button
                        onClick={() => handleRemoveCollaborator(id)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                {selectedCollaborators.length === 0 && (
                  <p className="text-sm text-muted-foreground">No collaborators added yet.</p>
                )}
              </TabsContent>
            </Tabs>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsEditDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateInvestigation} disabled={loading}>
                {loading ? "Updating..." : "Update Investigation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Investigation</DialogTitle>
              <DialogDescription>Share this investigation or add optional collaborators.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Share Link</h3>
                <div className="flex items-center space-x-2">
                  <Input value={`https://solana-forensics.com/investigations/${currentInvestigation?.id}`} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://solana-forensics.com/investigations/${currentInvestigation?.id}`,
                      )
                      alert("Link copied to clipboard!")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Add Collaborators (Optional)</h3>
                <div className="flex space-x-2">
                  <Select value={currentCollaborator} onValueChange={setCurrentCollaborator}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select collaborator" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleAddCollaborator} disabled={!currentCollaborator}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-4 space-y-2">
                <h3 className="text-sm font-medium">Current Collaborators</h3>
                {selectedCollaborators.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCollaborators.map((id) => {
                      const collaborator = collaborators.find((c) => c.id === id)
                      return (
                        <div key={id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {collaborator?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{getCollaboratorName(id)}</p>
                              <p className="text-xs text-muted-foreground">
                                {collaborator?.email || "No email available"}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveCollaborator(id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No collaborators added yet.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsShareDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvestigations.length > 0 ? (
          filteredInvestigations.map((investigation) => (
            <Card key={investigation.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold truncate">{investigation.title}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(investigation)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShareClick(investigation)}>
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteInvestigation(investigation.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="truncate">{investigation.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getStatusColor(investigation.status)}>
                    {investigation.status.charAt(0).toUpperCase() + investigation.status.slice(1)}
                  </Badge>
                  <Badge className={getPriorityColor(investigation.priority)}>
                    {investigation.priority.charAt(0).toUpperCase() + investigation.priority.slice(1)} Priority
                  </Badge>
                </div>

                <div className="space-y-2">
                  {investigation.addresses.length > 0 && (
                    <div className="flex items-center text-sm">
                      <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{investigation.addresses.length} addresses</span>
                    </div>
                  )}

                  {investigation.transactions.length > 0 && (
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{investigation.transactions.length} transactions</span>
                    </div>
                  )}

                  {investigation.tags.length > 0 && (
                    <div className="flex items-center text-sm">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {investigation.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {investigation.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{investigation.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {(investigation.collaborators?.length || 0) > 0 && (
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{investigation.collaborators?.length} collaborators</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Created {formatDistanceToNow(new Date(investigation.createdAt), { addSuffix: true })}</span>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <a href={`/investigations/${investigation.id}`} className="flex items-center">
                    View
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border rounded-lg">
            <div className="mb-4 p-4 bg-muted rounded-full">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No investigations found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter || priorityFilter
                ? "No investigations match your current filters."
                : "Get started by creating your first investigation."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Investigation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
