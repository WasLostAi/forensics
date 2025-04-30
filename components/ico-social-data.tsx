"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Twitter, MessageCircle, MessagesSquare, ExternalLink } from "lucide-react"
import { MonitoringService } from "@/lib/monitoring-service"
import { Button } from "@/components/ui/button"

interface ICOSocialDataProps {
  address: string
}

export function ICOSocialData({ address }: ICOSocialDataProps) {
  const [loading, setLoading] = useState(true)
  const [socialData, setSocialData] = useState<{
    twitterMentions: number
    discordMentions: number
    telegramMentions: number
    recentPosts: {
      platform: string
      content: string
      url: string
      timestamp: string
    }[]
  } | null>(null)

  useEffect(() => {
    async function loadSocialData() {
      try {
        const data = await MonitoringService.getSocialMediaMentions(address)
        setSocialData(data)
      } catch (error) {
        console.error("Error loading social data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSocialData()
  }, [address])

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Twitter className="h-4 w-4" />
      case "Discord":
        return <MessagesSquare className="h-4 w-4" />
      case "Telegram":
        return <MessageCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{platform}</Badge>
      case "Discord":
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">{platform}</Badge>
      case "Telegram":
        return <Badge className="bg-sky-500 hover:bg-sky-600">{platform}</Badge>
      default:
        return <Badge>{platform}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!socialData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-medium">No social data available</h3>
        <p className="text-muted-foreground mt-2">Social media data is not available for this project</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Twitter Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Twitter className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{socialData.twitterMentions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Discord Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessagesSquare className="h-5 w-5 mr-2 text-indigo-500" />
              <span className="text-2xl font-bold">{socialData.discordMentions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Telegram Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-sky-500" />
              <span className="text-2xl font-bold">{socialData.telegramMentions}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Social Media Posts</CardTitle>
          <CardDescription>Recent mentions of this project on social media</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialData.recentPosts.map((post, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {getPlatformIcon(post.platform)}
                      <span className="ml-2 font-medium">{post.platform}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {new Date(post.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {getPlatformBadge(post.platform)}
                  </div>
                  <p className="mt-2">{post.content}</p>
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Post
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
