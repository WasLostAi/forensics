"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  MoreHorizontal,
  Search,
  Mail,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
} from "lucide-react"

interface Collaborator {
  id: string
  name: string
  email: string
  role: "admin" | "analyst" | "viewer"
  status: "active" | "pending" | "inactive"
  avatarUrl?: string
  lastActive?: string
}

interface CollaborationActivity {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  timestamp: string
  details?: string
}

export function CollaboratorsView() {
  const [activeTab, setActiveTab] = useState("team")
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [activities, setActivities] = useState<CollaborationActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"analyst" | "viewer">("analyst")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadCollaborators() {
      setIsLoading(true)
      setError(null)
      try {
        // In a real implementation, this would fetch from your database
        // For now, we'll use mock data
        const mockCollaborators: Collaborator[] = [
          {
            id: "1",
            name: "Alex Johnson",
            email: "alex@example.com",
            role: "admin",
            status: "active",
            lastActive: "2023-11-28T14:32:21Z",
          },
          {
            id: "2",
            name: "Maria Garcia",
            email: "maria@example.com",
            role: "analyst",
            status: "active",
            lastActive: "2023-11-27T09:15:43Z",
          },
          {
            id: "3",
            name: "Sam Wilson",
            email: "sam@example.com",
            role: "viewer",
            status: "active",
            lastActive: "2023-11-25T16:42:11Z",
          },
          {
            id: "4",
            name: "Taylor Kim",
            email: "taylor@example.com",
            role: "analyst",
            status: "pending",
          },
          {
            id: "5",
            name: "Jordan Lee",
            email: "jordan@example.com",
            role: "viewer",
            status: "inactive",
            lastActive: "2023-10-15T11:23:45Z",
          },
        ]

        const mockActivities: CollaborationActivity[] = [
          {
            id: "1",
            userId: "1",
            userName: "Alex Johnson",
            action: "created",
            resource: "Investigation #1234",
            timestamp: "2023-11-28T14:32:21Z",
          },
          {
            id: "2",
            userId: "2",
            userName: "Maria Garcia",
            action: "updated",
            resource: "Wallet Analysis",
            timestamp: "2023-11-27T09:15:43Z",
            details: "Added risk assessment notes",
          },
          {
            id: "3",
            userId: "3",
            userName: "Sam Wilson",
            action: "viewed",
            resource: "Transaction Flow",
            timestamp: "2023-11-25T16:42:11Z",
          },
          {
            id: "4",
            userId: "1",
            userName: "Alex Johnson",
            action: "exported",
            resource: "Risk Report",
            timestamp: "2023-11-24T10:11:32Z",
            details: "PDF format",
          },
          {
            id: "5",
            userId: "2",
            userName: "Maria Garcia",
            action: "shared",
            resource: "Entity Labels",
            timestamp: "2023-11-23T15:27:19Z",
            details: "Shared with team",
          },
        ]

        setCollaborators(mockCollaborators)
        setActivities(mockActivities)
      } catch (err) {
        console.error("Failed to load collaborators:", err)
        setError("Failed to load collaborators. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCollaborators()
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    setInviteSuccess(false)

    try {
      // In a real implementation, this would send an invitation
      // For now, we'll simulate a successful invitation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add the new collaborator to the list
      const newCollaborator: Collaborator = {
        id: `new-${Date.now()}`,
        name: inviteEmail.split("@")[0], // Use part of email as name
        email: inviteEmail,
        role: inviteRole,
        status: "pending",
      }

      setCollaborators([...collaborators, newCollaborator])
      setInviteSuccess(true)
      setInviteEmail("")
    } catch (err) {
      console.error("Failed to send invitation:", err)
      setError("Failed to send invitation. Please try again.")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = (userId: string, newRole: "admin" | "analyst" | "viewer") => {
    setCollaborators(collaborators.map((collab) => (collab.id === userId ? { ...collab, role: newRole } : collab)))
  }

  const handleStatusChange = (userId: string, newStatus: "active" | "pending" | "inactive") => {
    setCollaborators(collaborators.map((collab) => (collab.id === userId ? { ...collab, status: newStatus } : collab)))
  }

  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(collaborators.filter((collab) => collab.id !== userId))
  }

  const filteredCollaborators = collaborators.filter(
    (collab) =>
      collab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collab.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "analyst":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      default:
        return "destructive"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>Send an invitation to collaborate on forensic investigations.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role
                    </label>
                    <select
                      id="role"
                      className="w-full p-2 border rounded-md"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as "analyst" | "viewer")}
                    >
                      <option value="analyst">Analyst (can edit)</option>
                      <option value="viewer">Viewer (read-only)</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Admins can manage team members and all investigations.
                    </p>
                  </div>

                  {inviteSuccess && (
                    <Alert variant="success" className="bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription>Invitation sent successfully!</AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteEmail("")}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                    {isInviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage access and permissions for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollaborators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? "No team members match your search"
                          : "No team members found. Invite someone to get started!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCollaborators.map((collaborator) => (
                      <TableRow key={collaborator.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={collaborator.avatarUrl || "/placeholder.svg"} />
                              <AvatarFallback>
                                {collaborator.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{collaborator.name}</div>
                              <div className="text-sm text-muted-foreground">{collaborator.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                            {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              collaborator.status === "active"
                                ? "success"
                                : collaborator.status === "pending"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {collaborator.status.charAt(0).toUpperCase() + collaborator.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {collaborator.lastActive ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{formatDate(collaborator.lastActive)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `mailto:${collaborator.email}`
                                }}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(collaborator.id, "admin")}
                                disabled={collaborator.role === "admin"}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(collaborator.id, "analyst")}
                                disabled={collaborator.role === "analyst"}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Make Analyst
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(collaborator.id, "viewer")}
                                disabled={collaborator.role === "viewer"}
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(collaborator.id, "active")}
                                disabled={collaborator.status === "active"}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Set Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(collaborator.id, "inactive")}
                                disabled={collaborator.status === "inactive"}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Set Inactive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemoveCollaborator(collaborator.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                Remove Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Activity</CardTitle>
              <CardDescription>Recent actions by team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-md">
                    <Avatar>
                      <AvatarFallback>
                        {activity.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <span className="font-medium">{activity.userName}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>{" "}
                          <span className="font-medium">{activity.resource}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                      {activity.details && <div className="mt-1 text-sm text-muted-foreground">{activity.details}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
