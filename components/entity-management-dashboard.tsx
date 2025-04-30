"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLabelManagement } from "@/components/entity-label-management"
import { EntityClusterManagement } from "@/components/entity-cluster-management"
import { EntityLabelStatistics } from "@/components/entity-label-statistics"
import { EntityLabelBulkOperations } from "@/components/entity-label-bulk-operations"
import { EntityLabelImportExport } from "@/components/entity-label-import-export"
import { useRouter } from "next/navigation"

export function EntityManagementDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("labels")
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, isLoading, router, isMounted])

  // Don't render anything on the server or until mounted on the client
  if (!isMounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Entity Management</h1>
          <p className="text-muted-foreground">Manage entity labels, clusters, and relationships</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="labels">Entity Labels</TabsTrigger>
          <TabsTrigger value="clusters">Entity Clusters</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="labels" className="space-y-4">
          <EntityLabelManagement />
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <EntityClusterManagement />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <EntityLabelStatistics />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <EntityLabelBulkOperations />
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <EntityLabelImportExport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
