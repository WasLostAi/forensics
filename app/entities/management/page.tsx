import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLabelManagement } from "@/components/entity-label-management"
import { EntityLabelBulkOperations } from "@/components/entity-label-bulk-operations"
import { EntityLabelImportExport } from "@/components/entity-label-import-export"
import { EntityLabelStatistics } from "@/components/entity-label-statistics"

export default function EntityManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Entity Label Management</h1>
        <p className="text-muted-foreground">
          Manage, import, export, and analyze entity labels for wallets on the Solana blockchain.
        </p>
      </div>

      <Tabs defaultValue="labels" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
