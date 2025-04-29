"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, AlertTriangle, Shield, Wallet, Coins, Twitter } from "lucide-react"
import { MaliciousWalletMonitor } from "@/components/malicious-wallet-monitor"
import { TokenCreationMonitor } from "@/components/token-creation-monitor"
import { IcoLaunchMonitor } from "@/components/ico-launch-monitor"
import { AlertCenter } from "@/components/alert-center"

export function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-genos font-bold solana-gradient-text">Monitoring Center</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of suspicious activities across the Solana ecosystem
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Configure Alerts
          </Button>
          <Button className="gap-2">
            <Shield className="h-4 w-4" />
            Active Monitoring
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#9945FF]/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-genos flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#9945FF]" />
                Wallet Monitoring
              </CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Active
              </Badge>
            </div>
            <CardDescription>Detecting suspicious wallet creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alerts today</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High severity</p>
                <p className="text-2xl font-bold text-red-500">2</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monitored</p>
                <p className="text-2xl font-bold">1.2k</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#14F195]/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-genos flex items-center gap-2">
                <Coins className="h-5 w-5 text-[#14F195]" />
                Token Monitoring
              </CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Active
              </Badge>
            </div>
            <CardDescription>Tracking new token creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New tokens</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suspicious</p>
                <p className="text-2xl font-bold text-yellow-500">5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High risk</p>
                <p className="text-2xl font-bold text-red-500">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9945FF]/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-genos flex items-center gap-2">
                <Twitter className="h-5 w-5 text-[#9945FF]" />
                ICO Monitoring
              </CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Active
              </Badge>
            </div>
            <CardDescription>Tracking ICO launches on X</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ICOs detected</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-500">4</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suspicious</p>
                <p className="text-2xl font-bold text-yellow-500">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>High Risk Alert</AlertTitle>
        <AlertDescription>
          Suspicious token creation detected with potential rug pull indicators.
          <Button variant="link" className="h-auto p-0 ml-2">
            View Details
          </Button>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="wallet" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-secondary/40 backdrop-blur-sm">
          <TabsTrigger value="wallet" className="font-genos">
            Malicious Wallets
          </TabsTrigger>
          <TabsTrigger value="token" className="font-genos">
            Token Creation
          </TabsTrigger>
          <TabsTrigger value="ico" className="font-genos">
            ICO Launches
          </TabsTrigger>
          <TabsTrigger value="alerts" className="font-genos">
            Alert Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">
          <MaliciousWalletMonitor />
        </TabsContent>

        <TabsContent value="token" className="space-y-4">
          <TokenCreationMonitor />
        </TabsContent>

        <TabsContent value="ico" className="space-y-4">
          <IcoLaunchMonitor />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertCenter />
        </TabsContent>
      </Tabs>
    </div>
  )
}
