"use client"

import { useState } from "react"
import type { ICOProject } from "@/types/monitoring"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, AlertTriangle, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { ICOFundFlow } from "@/components/ico-fund-flow"
import { ICORiskAnalysis } from "@/components/ico-risk-analysis"
import { ICOSocialData } from "@/components/ico-social-data"
import { ICOTransactionHistory } from "@/components/ico-transaction-history"
import { ICOTransactionTimeline } from "@/components/ico-transaction-timeline"
import { WalletRelationshipGraph } from "@/components/wallet-relationship-graph"

interface ICODetailViewProps {
  project: ICOProject
}

export function ICODetailView({ project }: ICODetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      case "rugpull":
        return <Badge variant="destructive">Rug Pull</Badge>
      case "successful":
        return <Badge className="bg-green-500">Successful</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 75) {
      return (
        <Badge variant="destructive" className="ml-2">
          High Risk
        </Badge>
      )
    } else if (score >= 40) {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 ml-2">
          Medium Risk
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 ml-2">
          Low Risk
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/monitoring"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Monitoring
          </Link>
          <h1 className="text-3xl font-bold flex items-center flex-wrap gap-2">
            {project.name} ({project.symbol}){getStatusBadge(project.currentStatus)}
            {getRiskBadge(project.riskScore)}
          </h1>
        </div>
        <div className="flex gap-2">
          {project.socialLinks.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.socialLinks.website} target="_blank" rel="noopener noreferrer">
                Website <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
          {project.socialLinks.twitter && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                Twitter <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
          {project.socialLinks.telegram && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                Telegram <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Raised Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
              {project.raisedAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Launch Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-1" />
              {new Date(project.launchDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <AlertTriangle
                className={`h-5 w-5 mr-1 ${project.riskScore >= 75 ? "text-red-500" : project.riskScore >= 40 ? "text-orange-500" : "text-green-500"}`}
              />
              {project.riskScore}/100
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="fundflow">Fund Flow</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="social">Social Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Key information about {project.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-muted-foreground">
                    {project.description ||
                      `${project.name} (${project.symbol}) is a token launched on the Solana blockchain.`}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Contract Address</h3>
                  <div className="flex items-center">
                    <code className="bg-muted p-2 rounded font-mono text-sm">{project.address}</code>
                    <Button variant="ghost" size="icon" className="ml-1" asChild>
                      <a href={`https://solscan.io/token/${project.address}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ICOFundFlow project={project} />
                  <ICORiskAnalysis project={project} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <ICOTransactionTimeline address={project.address} />
        </TabsContent>

        <TabsContent value="relationships" className="mt-4">
          <WalletRelationshipGraph address={project.address} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <ICOTransactionHistory address={project.address} />
        </TabsContent>

        <TabsContent value="fundflow" className="mt-4">
          <ICOFundFlow project={project} fullView />
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <ICORiskAnalysis project={project} fullView />
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <ICOSocialData address={project.address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
