"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Clock, Edit, Trash2, Plus, Search, Share2 } from "lucide-react"

interface Investigation {
  id: string
  title: string
  description: string
  walletAddress: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export function SavedInvestigations() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [tags, setTags] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Load saved investigations from localStorage
    const savedInvestigations = localStorage.getItem("saved-investigations")
    if (savedInvestigations) {
      setInvestigations(JSON.parse(savedInvestigations))
    } else {
      // Mock data for demo
      const mockInvestigations: Investigation[] = [
        {
          id: "1",
          title: "Suspicious Exchange Activity",
          description: "Investigation into unusual transaction patterns from Binance hot wallet",
          walletAddress: "14FUT96s9swbmH7ZjpDvfEDywnAYy9zaNhv4HvB8F7oA",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["exchange", "high-volume", "suspicious"],
        },
        {
          id: "2",
          title: "Potential Rugpull Analysis",
          description: "Tracking fund movements from suspected rugpull token",
          walletAddress: "Rug9PulL5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4LRH",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          tags: ["token", "rugpull", "high-risk"],
        },
      ]
      setInvestigations(mockInvestigations)
      localStorage.setItem("saved-investigations", JSON.stringify(mockInvestigations))
    }
  }, [])

  const saveInvestigations = (updatedInvestigations: Investigation[]) => {
    setInvestigations(updatedInvestigations)
    localStorage.setItem("saved-investigations", JSON.stringify(updatedInvestigations))
  }

  const handleSaveInvestigation = () => {
    if (!title || !walletAddress) return

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    if (currentInvestigation) {
      // Update existing investigation
      const updatedInvestigations = investigations.map((inv) =>
        inv.id === currentInvestigation.id
          ? {
              ...inv,
              title,
              description,
              walletAddress,
              updatedAt: new Date().toISOString(),
              tags: tagArray,
            }
          : inv,
      )
      saveInvestigations(updatedInvestigations)
    } else {
      // Create new investigation
      const newInvestigation: Investigation = {
        id: Date.now().toString(),
        title,
        description,
        walletAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: tagArray,
      }
      saveInvestigations([...investigations, newInvestigation])
    }

    // Reset form
    setTitle("")
    setDescription("")
    setWalletAddress("")
    setTags("")
    setCurrentInvestigation(null)
    setIsDialogOpen(false)
  }

  const handleEditInvestigation = (investigation: Investigation) => {
    setCurrentInvestigation(investigation)
    setTitle(investigation.title)
    setDescription(investigation.description)
    setWalletAddress(investigation.walletAddress)
    setTags(investigation.tags.join(", "))
    setIsDialogOpen(true)
  }

  const handleDeleteInvestigation = (id: string) => {
    const updatedInvestigations = investigations.filter((inv) => inv.id !== id)
    saveInvestigations(updatedInvestigations)
  }

  const handleNewInvestigation = () => {
    setCurrentInvestigation(null)
    setTitle("")
    setDescription("")
    setWalletAddress("")
    setTags("")
    setIsDialogOpen(true)
  }

  const filteredInvestigations = investigations.filter(
    (inv) =>
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Investigations</h2>
        <Button onClick={handleNewInvestigation}>
          <Plus className="mr-2 h-4 w-4" />
          New Investigation
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search investigations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredInvestigations.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground">No investigations found</p>
                <Button variant="link" onClick={handleNewInvestigation}>
                  Create your first investigation
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInvestigations.map((investigation) => (
                <Card key={investigation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{investigation.title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditInvestigation(investigation)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(investigation.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{investigation.description}</p>
                    <p className="mt-2 font-mono text-xs text-muted-foreground truncate">
                      {investigation.walletAddress}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {investigation.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/wallet/${investigation.walletAddress}`}>Open</a>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteInvestigation(investigation.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvestigations
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 6)
              .map((investigation) => (
                <Card key={investigation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{investigation.title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditInvestigation(investigation)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(investigation.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{investigation.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {investigation.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/wallet/${investigation.walletAddress}`}>Open</a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInvestigation(investigation.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="high-risk" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvestigations
              .filter((inv) => inv.tags.some((tag) => ["high-risk", "suspicious", "scam", "rugpull"].includes(tag)))
              .map((investigation) => (
                <Card key={investigation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{investigation.title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditInvestigation(investigation)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(investigation.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{investigation.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {investigation.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/wallet/${investigation.walletAddress}`}>Open</a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInvestigation(investigation.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentInvestigation ? "Edit Investigation" : "New Investigation"}</DialogTitle>
            <DialogDescription>
              {currentInvestigation
                ? "Update the details of your investigation"
                : "Save your current investigation for future reference"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
              <Textarea
                id="description"
                placeholder="Brief description of this investigation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="Primary wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="exchange, high-risk, suspicious"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInvestigation}>
              <Bookmark className="mr-2 h-4 w-4" />
              {currentInvestigation ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
