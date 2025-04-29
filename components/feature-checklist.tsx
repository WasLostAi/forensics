"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Wallet, Network, Tag, BarChart2, Bookmark, FileText } from "lucide-react"
import Link from "next/link"

// Define the feature data structure without React components
interface FeatureData {
  id: string
  title: string
  description: string
  iconType: string // Store icon type as a string
  link: string
  completed: boolean
}

// Full feature with React component
interface Feature extends Omit<FeatureData, "iconType"> {
  icon: React.ReactNode
}

// Map icon types to React components
const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case "wallet":
      return <Wallet className="h-5 w-5 text-[#9945FF]" />
    case "network":
      return <Network className="h-5 w-5 text-[#14F195]" />
    case "tag":
      return <Tag className="h-5 w-5 text-[#9945FF]" />
    case "chart":
      return <BarChart2 className="h-5 w-5 text-[#14F195]" />
    case "bookmark":
      return <Bookmark className="h-5 w-5 text-[#9945FF]" />
    case "file":
      return <FileText className="h-5 w-5 text-[#14F195]" />
    default:
      return null
  }
}

// Initial feature data without React components
const initialFeatureData: FeatureData[] = [
  {
    id: "wallet-analysis",
    title: "Analyze a Wallet",
    description: "Search and analyze your first Solana wallet address",
    iconType: "wallet",
    link: "/wallet",
    completed: false,
  },
  {
    id: "transaction-flow",
    title: "Explore Transaction Flow",
    description: "Visualize how funds move between wallets",
    iconType: "network",
    link: "/wallet?tab=flow",
    completed: false,
  },
  {
    id: "entity-labels",
    title: "Review Entity Labels",
    description: "Identify exchanges and known entities",
    iconType: "tag",
    link: "/wallet?tab=entities",
    completed: false,
  },
  {
    id: "funding-analysis",
    title: "Analyze Funding Sources",
    description: "Track the origin of funds in a wallet",
    iconType: "chart",
    link: "/wallet?tab=funding",
    completed: false,
  },
  {
    id: "save-investigation",
    title: "Save an Investigation",
    description: "Create your first saved investigation",
    iconType: "bookmark",
    link: "/investigations",
    completed: false,
  },
  {
    id: "export-report",
    title: "Export a Report",
    description: "Generate your first forensic report",
    iconType: "file",
    link: "/reports",
    completed: false,
  },
]

export function FeatureChecklist() {
  const [featureData, setFeatureData] = useState<FeatureData[]>(initialFeatureData)

  // Convert feature data to full features with React components
  const features: Feature[] = featureData.map((data) => ({
    id: data.id,
    title: data.title,
    description: data.description,
    icon: getIconComponent(data.iconType),
    link: data.link,
    completed: data.completed,
  }))

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedFeatures = localStorage.getItem("feature-checklist")
      if (savedFeatures) {
        setFeatureData(JSON.parse(savedFeatures))
      }
    } catch (error) {
      console.error("Error loading feature checklist from localStorage:", error)
    }
  }, [])

  // Save state to localStorage when features change
  const handleToggleFeature = (id: string) => {
    const updatedFeatureData = featureData.map((feature) =>
      feature.id === id ? { ...feature, completed: !feature.completed } : feature,
    )

    setFeatureData(updatedFeatureData)

    try {
      localStorage.setItem("feature-checklist", JSON.stringify(updatedFeatureData))
    } catch (error) {
      console.error("Error saving feature checklist to localStorage:", error)
    }
  }

  const completedCount = features.filter((feature) => feature.completed).length
  const progress = (completedCount / features.length) * 100

  return (
    <Card className="border-border/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-genos solana-gradient-text">Feature Checklist</CardTitle>
            <CardDescription>Track your progress exploring the toolkit</CardDescription>
          </div>
          <Badge variant={progress === 100 ? "default" : "outline"} className="font-genos">
            {completedCount}/{features.length} Completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="space-y-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`flex items-start space-x-4 rounded-md border p-4 transition-colors ${
                feature.completed ? "border-[#14F195]/30 bg-[#14F195]/5" : "border-border/30 hover:border-[#9945FF]/30"
              }`}
            >
              <Checkbox
                id={feature.id}
                checked={feature.completed}
                onCheckedChange={() => handleToggleFeature(feature.id)}
                className={feature.completed ? "text-[#14F195] border-[#14F195]" : ""}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center">
                  {feature.icon}
                  <label htmlFor={feature.id} className="ml-2 font-medium cursor-pointer select-none">
                    {feature.title}
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={feature.link}>Explore</Link>
              </Button>
            </div>
          ))}
        </div>

        {progress === 100 && (
          <div className="mt-6 rounded-md bg-[#14F195]/10 p-4 border border-[#14F195]/30">
            <p className="font-medium text-[#14F195]">Congratulations! You've explored all features.</p>
            <p className="text-sm text-muted-foreground mt-1">
              You're now ready to use the full power of the Solana Forensic Toolkit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
