import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLabelManagement } from "@/components/entity-label-management"
import { EntityLabelBulkOperations } from "@/components/entity-label-bulk-operations"
import { EntityLabelImportExport } from "@/components/entity-label-import-export"
import { EntityLabelStatistics } from "@/components/entity-label-statistics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Network, Users, Tag, FileJson, BarChart3 } from "lucide-react"
import Link from "next/link"
import { EntityClusterManagement } from "@/components/entity-cluster-management"

export default function EntityManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Entity Management</h1>
          <p className="text-muted-foreground">Manage, connect, and analyze entities on the Solana blockchain.</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/entity-clusters">
              <Network className="mr-2 h-4 w-4" />
              View Entity Clusters
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Entity Labels
            </CardTitle>
            <CardDescription>Identify and categorize blockchain entities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Create, edit, and manage labels for wallet addresses to track known entities.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Network className="mr-2 h-5 w-5" />
              Entity Connections
            </CardTitle>
            <CardDescription>Map relationships between entities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Create connections between entities to establish and visualize relationships.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Entity Clusters
            </CardTitle>
            <CardDescription>Group similar entities by behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Automatically or manually group entities into clusters based on similar behavior patterns.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="labels" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="labels">
            <Tag className="mr-2 h-4 w-4" />
            Labels
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Users className="mr-2 h-4 w-4" />
            Bulk Operations
          </TabsTrigger>
          <TabsTrigger value="import-export">
            <FileJson className="mr-2 h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="clusters">
            <Network className="mr-2 h-4 w-4" />
            Clusters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="labels" className="space-y-6">
          <EntityLabelManagement />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <EntityLabelBulkOperations />
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <EntityLabelImportExport />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <EntityLabelStatistics />
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6">
          <EntityClusterManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
