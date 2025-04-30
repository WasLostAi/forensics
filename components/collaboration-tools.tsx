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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Copy, Share2, Mail, LinkIcon, Users, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CollaborationToolsProps {
  walletAddress: string
  investigationId?: string
  investigationTitle?: string
}

export function CollaborationTools({
  walletAddress,
  investigationId,
  investigationTitle = "Wallet Analysis",
}: CollaborationToolsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("link")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [includeReadOnly, setIncludeReadOnly] = useState(true)
  const [includeComments, setIncludeComments] = useState(true)

  const shareableLink = `${window.location.origin}/shared/${investigationId || walletAddress}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setShareLinkCopied(true)
    setTimeout(() => setShareLinkCopied(false), 2000)
  }

  const [shareLinkCopied, setShareLinkCopied] = useState(false)

  const handleSendInvites = async () => {
    setIsSending(true)
    setSendError(null)
    setSendSuccess(false)

    try {
      // In a real implementation, this would call an API to send invites
      // For now, we'll just simulate a successful send
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSendSuccess(true)
      setEmailRecipients("")
      setEmailMessage("")
    } catch (error) {
      console.error("Failed to send invites:", error)
      setSendError("Failed to send invites. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Investigation</DialogTitle>
            <DialogDescription>
              Share this wallet analysis with your team or export it for collaboration.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Link
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="share-link">Shareable Link</Label>
                <div className="flex items-center space-x-2">
                  <Input id="share-link" value={shareableLink} readOnly />
                  <Button size="sm" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {shareLinkCopied && <p className="text-xs text-green-500">Link copied to clipboard!</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="read-only">Read-only access</Label>
                  <Switch id="read-only" checked={includeReadOnly} onCheckedChange={setIncludeReadOnly} />
                </div>
                <p className="text-xs text-muted-foreground">Recipients can view but not modify the investigation.</p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-recipients">Email Recipients</Label>
                <Input
                  id="email-recipients"
                  placeholder="email@example.com, another@example.com"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Separate multiple emails with commas.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Message (Optional)</Label>
                <Textarea
                  id="email-message"
                  placeholder="I'd like to share this wallet analysis with you..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-comments">Include comments</Label>
                  <Switch id="include-comments" checked={includeComments} onCheckedChange={setIncludeComments} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include any comments and notes added to the investigation.
                </p>
              </div>

              {sendError && (
                <Alert variant="destructive">
                  <AlertDescription>{sendError}</AlertDescription>
                </Alert>
              )}

              {sendSuccess && (
                <Alert variant="success">
                  <AlertDescription>Invitations sent successfully!</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="team" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Team Workspace</Label>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Forensics Team</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Share
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share with all members of your forensics team workspace.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recent Collaborators</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <span>alice@example.com</span>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <span>bob@example.com</span>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {activeTab === "email" && (
              <Button onClick={handleSendInvites} disabled={isSending || !emailRecipients.trim()}>
                {isSending ? "Sending..." : "Send Invites"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
