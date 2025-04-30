import type { Metadata } from "next"
import { BulkEntityLabeling } from "@/components/bulk-entity-labeling"
import { EntityLabelBulkOperations } from "@/components/entity-label-bulk-operations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Bulk Entity Operations | Solana Forensics",
  description: "Perform bulk operations on entities such as labeling, tagging, and categorization.",
}

export default function BulkEntityOperationsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Entity Operations</h1>
        <p className="text-muted-foreground">Efficiently manage multiple entities at once with bulk operations.</p>
      </div>

      <Tabs defaultValue="labeling" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="labeling">Bulk Labeling</TabsTrigger>
          <TabsTrigger value="operations">Other Operations</TabsTrigger>
        </TabsList>
        <TabsContent value="labeling" className="mt-4">
          <BulkEntityLabeling />
        </TabsContent>
        <TabsContent value="operations" className="mt-4">
          <EntityLabelBulkOperations />
        </TabsContent>
      </Tabs>
    </div>
  )
}
