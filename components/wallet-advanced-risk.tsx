"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Shield, Filter, Zap, Twitter, MessageCircle, ExternalLink, Info } from "lucide-react"
import { MonitoringService } from "@/lib/monitoring-service"

interface WalletAdvancedRiskProps {
  walletAddress: string
}

export function WalletAdvancedRisk({ walletAddress }: WalletAdvancedRiskProps) {
  const [loading, setLoading] = useState(true)
  const [mixerData, setMixerData] = useState<any>(null)
  const [sniperData, setSniperData] = useState<any>(null)
  const [rugPullData, setRugPullData] = useState<any>(null)
  const [socialData, setSocialData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load all data in parallel
        const [mixerResult, sniperResult, rugPullResult, socialResult] = await Promise.all([
          MonitoringService.analyzeMixerUsage(walletAddress),
          MonitoringService.checkSniperActivity(walletAddress),
          MonitoringService.checkRugPullAssociation(walletAddress),
          MonitoringService.getSocialMediaMentions(walletAddress),
        ])

        setMixerData(mixerResult)
        setSniperData(sniperResult)
        setRugPullData(rugPullResult)
        setSocialData(socialResult)
      } catch (error) {
        console.error("Error loading advanced risk data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [walletAddress])

  // Calculate overall risk score
  const calculateOverallRisk = () => {
    if (!mixerData || !sniperData || !rugPullData) return 0

    // Weight the different risk factors
    const mixerWeight = 0.4
    const sniperWeight = 0.3
    const rugPullWeight = 0.3

    // Calculate weighted score
    const mixerScore = mixerData.usedMixer ? mixerData.riskScore : 0
    const sniperScore = sniperData.isSniper ? sniperData.riskScore : 0
    const rugPullScore = rugPullData.isRugPuller ? rugPullData.riskScore : 0

    return Math.round(mixerScore * mixerWeight + sniperScore * sniperWeight + rugPullScore * rugPullWeight)
  }

  const overallRiskScore = calculateOverallRisk()
  const riskLevel = overallRiskScore >= 70 ? "high" : overallRiskScore >= 40 ? "medium" : "low"

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Analyzing wallet risk...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Advanced Risk Analysis</span>
          <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "warning" : "outline"}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of high-risk activities for wallet {walletAddress.substring(0, 6)}...
          {walletAddress.substring(walletAddress.length - 4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Risk Score Gauge */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Overall Risk Score</h3>
              <span
                className={`text-2xl font-bold ${
                  riskLevel === "high" ? "text-red-500" : riskLevel === "medium" ? "text-yellow-500" : "text-green-500"
                }`}
              >
                {overallRiskScore}/100
              </span>
            </div>
            <Progress
              value={overallRiskScore}
              max={100}
              className="h-3"
              indicatorClassName={
                overallRiskScore >= 70 ? "bg-red-500" : overallRiskScore >= 40 ? "bg-yellow-500" : "bg-green-500"
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Risk Factors Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mixer">Mixer Usage</TabsTrigger>
              <TabsTrigger value="sniper">Sniper Activity</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mixer Overview */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Filter className={`h-8 w-8 ${mixerData.usedMixer ? "text-red-500" : "text-green-500"}`} />
                      <h3 className="font-medium">Mixer Usage</h3>
                      <Badge variant={mixerData.usedMixer ? "destructive" : "outline"} className="mt-1">
                        {mixerData.usedMixer ? "DETECTED" : "NONE DETECTED"}
                      </Badge>
                      {mixerData.usedMixer && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Volume: ${mixerData.volume.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Sniper Overview */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Zap className={`h-8 w-8 ${sniperData.isSniper ? "text-yellow-500" : "text-green-500"}`} />
                      <h3 className="font-medium">Sniper Activity</h3>
                      <Badge variant={sniperData.isSniper ? "warning" : "outline"} className="mt-1">
                        {sniperData.isSniper ? "ACTIVE" : "NONE DETECTED"}
                      </Badge>
                      {sniperData.isSniper && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Profit: ${sniperData.profit.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Rug Pull Overview */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <AlertTriangle
                        className={`h-8 w-8 ${rugPullData.isRugPuller ? "text-red-500" : "text-green-500"}`}
                      />
                      <h3 className="font-medium">Rug Pull Association</h3>
                      <Badge variant={rugPullData.isRugPuller ? "destructive" : "outline"} className="mt-1">
                        {rugPullData.isRugPuller ? "ASSOCIATED" : "NONE DETECTED"}
                      </Badge>
                      {rugPullData.isRugPuller && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Count: {rugPullData.rugPullCount} rug pulls
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Summary */}
              {(mixerData.usedMixer || sniperData.isSniper || rugPullData.isRugPuller) && (
                <Alert variant={riskLevel === "high" ? "destructive" : "warning"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Factors Detected</AlertTitle>
                  <AlertDescription>
                    This wallet has been associated with high-risk activities. Exercise caution when interacting with
                    this address.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="mixer">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Mixer Usage Analysis</h3>
                    <Badge variant={mixerData.usedMixer ? "destructive" : "outline"}>
                      {mixerData.usedMixer ? "DETECTED" : "NONE DETECTED"}
                    </Badge>
                  </div>

                  {mixerData.usedMixer ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="font-medium">${mixerData.volume.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Risk Score</p>
                          <p className="font-medium">{mixerData.riskScore}/100</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Associated Mixer Addresses</p>
                        <div className="space-y-2">
                          {mixerData.mixerAddresses.map((address: string, index: number) => (
                            <div key={index} className="p-2 bg-muted rounded-md font-mono text-xs">
                              {address}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Mixer Usage Detected</AlertTitle>
                        <AlertDescription>
                          This wallet has interacted with known mixer services, which are often used to obscure the
                          source of funds.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shield className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-lg font-medium">No Mixer Usage Detected</h3>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        This wallet has not been detected interacting with any known mixer services.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sniper">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Sniper Activity Analysis</h3>
                    <Badge variant={sniperData.isSniper ? "warning" : "outline"}>
                      {sniperData.isSniper ? "ACTIVE" : "NONE DETECTED"}
                    </Badge>
                  </div>

                  {sniperData.isSniper ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Profit</p>
                          <p className="font-medium">${sniperData.profit.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Transactions</p>
                          <p className="font-medium">{sniperData.transactionCount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="font-medium">{(sniperData.successRate * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertTitle>Sniper Bot Activity Detected</AlertTitle>
                        <AlertDescription>
                          This wallet exhibits patterns consistent with MEV extraction and sniper bot activity.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shield className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-lg font-medium">No Sniper Activity Detected</h3>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        This wallet does not show patterns consistent with MEV extraction or sniper bot activity.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Social Media Analysis</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Twitter className="h-3 w-3" /> {socialData.twitterMentions}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {socialData.discordMentions + socialData.telegramMentions}
                      </Badge>
                    </div>
                  </div>

                  {socialData.recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Recent Mentions</h4>
                      <div className="space-y-3">
                        {socialData.recentPosts.map((post: any, index: number) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{post.platform}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{post.content}</p>
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                              View Post <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Info className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Social Media Mentions</h3>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        This wallet has not been mentioned recently on monitored social media platforms.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
