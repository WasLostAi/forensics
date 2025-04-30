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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Share2, MessageSquare, Copy, Check, Mail, Send } from "lucide-react"

interface CollaborationToolsProps {
  walletAddress: string
  reportTitle?: string
}

export function CollaborationTools({ walletAddress, reportTitle = "Wallet Analysis" }: CollaborationToolsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("share")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [permission, setPermission] = useState("view")
  const [copied, setCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isShared, setIsShared] = useState(false)

  const shareLink = `https://solana-forensics.vercel.app/wallet/${walletAddress}?shared=true`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = () => {
    if (!email) return

    setIsSending(true)

    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      setIsShared(true)
      setEmail("")
      setMessage("")
    }, 1500)
  }

  const collaborators = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "Owner",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Sam Wilson",
      email: "sam@example.com",
      role: "Editor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Taylor Smith",
      email: "taylor@example.com",
      role: "Viewer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const comments = [
    {
      id: "1",
      author: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "I noticed a suspicious pattern in the transaction flow. Check the highlighted path.",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      author: "Sam Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "This wallet has connections to multiple exchanges. I've added labels for Binance and Kraken.",
      timestamp: "Yesterday",
    },
  ]

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collaboration Tools</DialogTitle>
            <DialogDescription>Share this investigation with your team or add comments</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="share" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="share" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy link</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Invite by Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="view">Can view</option>
                    <option value="edit">Can edit</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message to your invitation"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSendInvite} disabled={!email || isSending} className="w-full">
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>

              {isShared && (
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400 dark:text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Invitation sent successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <Label>Current Collaborators</Label>
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {collaborators.map((collaborator) => (
                        <li key={collaborator.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                              <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{collaborator.name}</p>
                              <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                            </div>
                          </div>
                          <Badge variant={collaborator.role === "Owner" ? "default" : "outline"}>
                            {collaborator.role}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 pt-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={comment.avatar} alt={comment.author} />
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Label htmlFor="new-comment">Add Comment</Label>
                <div className="mt-2 flex gap-3">
                  <Avatar>
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea id="new-comment" placeholder="Add your comment..." rows={2} />
                    <div className="flex justify-end">
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
