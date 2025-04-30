"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
  name: string
  status: "completed" | "in-progress" | "planned"
  description: string
}

const features: Feature[] = [
  {
    name: "Wallet Analysis Dashboard",
    status: "completed",
    description: "View comprehensive wallet details, transaction history, and token holdings",
  },
  {
    name: "Transaction Flow Visualization",
    status: "completed",
    description: "Interactive visualization of fund flows between wallets",
  },
  {
    name: "Entity Labeling System",
    status: "completed",
    description: "Database of known entities with management interface",
  },
  {
    name: "Transaction Clustering",
    status: "completed",
    description: "Group related transactions to identify patterns",
  },
  {
    name: "Risk Scoring",
    status: "completed",
    description: "Multi-factor risk assessment for wallets and transactions",
  },
  {
    name: "Monitoring Dashboard",
    status: "completed",
    description: "Real-time alerts for suspicious on-chain activities",
  },
  {
    name: "Investigation Management",
    status: "completed",
    description: "Create, manage, and share forensic investigations",
  },
  {
    name: "Export & Reporting",
    status: "completed",
    description: "Generate comprehensive reports in multiple formats",
  },
  {
    name: "Token Analysis",
    status: "completed",
    description: "Detailed analysis of token distribution and holder patterns",
  },
  {
    name: "Collaboration Tools",
    status: "completed",
    description: "Team collaboration features for investigations",
  },
  {
    name: "Advanced Filtering",
    status: "completed",
    description: "Complex query capabilities for transaction and wallet data",
  },
  {
    name: "API Integration",
    status: "in-progress",
    description: "REST API for programmatic access to forensic tools",
  },
]

export function FeatureChecklist() {
  const completedCount = features.filter((f) => f.status === "completed").length
  const inProgressCount = features.filter((f) => f.status === "in-progress").length
  const plannedCount = features.filter((f) => f.status === "planned").length

  const completionPercentage = Math.round((completedCount / features.length) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Implementation Progress</span>
          <span className="text-lg">{completionPercentage}% Complete</span>
        </CardTitle>
        <CardDescription>Current development status of platform features</CardDescription>
        <Progress value={completionPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Completed: {completedCount}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span>In Progress: {inProgressCount}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
            <span>Planned: {plannedCount}</span>
          </div>
        </div>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start p-3 rounded-lg",
                feature.status === "completed"
                  ? "bg-green-50 dark:bg-green-950/20"
                  : feature.status === "in-progress"
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : "bg-gray-50 dark:bg-gray-800/20",
              )}
            >
              <div className="mr-3 mt-0.5">
                {feature.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : feature.status === "in-progress" ? (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium">{feature.name}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <div className="ml-auto text-xs font-medium">
                {feature.status === "completed" ? (
                  <span className="text-green-600 dark:text-green-400">Completed</span>
                ) : feature.status === "in-progress" ? (
                  <span className="text-amber-600 dark:text-amber-400">In Progress</span>
                ) : (
                  <span className="text-gray-500">Planned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
