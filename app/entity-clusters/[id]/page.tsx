import { getEntityClusterById } from "@/lib/entity-clustering-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

interface EntityClusterPageProps {
  params: {
    id: string
  }
}

export default async function EntityClusterPage({ params }: EntityClusterPageProps) {
  const cluster = await getEntityClusterById(params.id)

  if (!cluster) {
    notFound()
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "exchange":
        return "bg-blue-500"
      case "individual":
        return "bg-green-500"
      case "contract":
        return "bg-purple-500"
      case "mixer":
        return "bg-yellow-500"
      case "scam":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cluster.name}</h1>
          <p className="text-muted-foreground">{cluster.description}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={`${getRiskBadgeColor(cluster.riskLevel)} text-white`}>
            {cluster.riskLevel.charAt(0).toUpperCase() + cluster.riskLevel.slice(1)} Risk
          </Badge>
          <Badge className={`${getCategoryBadgeColor(cluster.dominantCategory)} text-white`}>
            {cluster.dominantCategory.charAt(0).toUpperCase() + cluster.dominantCategory.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Entities in Cluster</CardTitle>
            <CardDescription>
              {cluster.entityCount} entities with {(cluster.similarityScore * 100).toFixed(0)}% similarity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cluster.entities.map((address) => (
                  <TableRow key={address}>
                    <TableCell className="font-mono">{address}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/wallet/${address}`}>View Wallet</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Patterns</CardTitle>
              <CardDescription>Common patterns observed in this cluster</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {cluster.behaviorPatterns.map((pattern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cluster Metrics</CardTitle>
              <CardDescription>Statistical information about this cluster</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Similarity Score</div>
                <div className="text-2xl font-bold">{(cluster.similarityScore * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">
                  Higher scores indicate more similar behavior patterns
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Entity Count</div>
                <div className="text-2xl font-bold">{cluster.entityCount}</div>
                <div className="text-xs text-muted-foreground">Number of entities in this cluster</div>
              </div>

              <div>
                <div className="text-sm font-medium">Created</div>
                <div className="text-lg">{new Date(cluster.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">When this cluster was first identified</div>
              </div>
            </CardContent>
          </Card>

          {cluster.riskLevel === "high" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>High Risk Cluster</AlertTitle>
              <AlertDescription>
                This cluster exhibits behavior patterns associated with high-risk activities. Monitor these entities
                closely.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
