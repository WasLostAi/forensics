import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLabelManagement } from "@/components/entity-label-management"
import { EntityClusterManagement } from "@/components/entity-cluster-management"
import { EntityManagementDashboardClient } from "@/components/entity-management-dashboard-client"
import { MockDataBanner } from "@/components/mock-data-banner"

export default function EntityManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <MockDataBanner />

      <h1 className="text-3xl font-bold">Entity Management</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="labels">Entity Labels</TabsTrigger>
          <TabsTrigger value="clusters">Entity Clusters</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <EntityManagementDashboardClient />
        </TabsContent>
        <TabsContent value="labels">
          <EntityLabelManagement />
        </TabsContent>
        <TabsContent value="clusters">
          <EntityClusterManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
