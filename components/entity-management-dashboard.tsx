"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EntityTable } from "@/components/entity-table"
import { EntityLabelForm } from "@/components/entity-label-form"
import { EntityClusterView } from "@/components/entity-cluster-view"
import { EntityStatistics } from "@/components/entity-statistics"
import { EntityBulkOperations } from "@/components/entity-bulk-operations"
import { EntityImportExport } from "@/components/entity-import-export"
import { EntityAdvancedSearch, type EntitySearchFilter } from "@/components/entity-advanced-search"
import { Database, Filter, Plus, Tag, Upload, Users } from "lucide-react"
import Link from "next/link"

export function EntityManagementDashboard() {
  const [searchFilters, setSearchFilters] = useState<EntitySearchFilter[]>([])
  const [showLabelForm, setShowLabelForm] = useState(false)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  const handleSearch = (filters: EntitySearchFilter[]) => {
    setSearchFilters(filters)
  }

  const handleAddEntity = () => {
    setSelectedEntityId(null)
    setShowLabelForm(true)
  }

  const handleEditEntity = (id: string) => {
    setSelectedEntityId(id)
    setShowLabelForm(true)
  }

  const handleFormClose = () => {
    setShowLabelForm(false)
    setSelectedEntityId(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Entity Management</h1>
          <p className="text-muted-foreground">
            Identify, categorize, and manage entities across the Solana blockchain
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddEntity}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entity
          </Button>
          <Button variant="outline" asChild>
            <Link href="/entity-clusters">
              <Users className="mr-2 h-4 w-4" />
              Clusters
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/entity-network">
              <Database className="mr-2 h-4 w-4" />
              Network
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Entity Database
            </CardTitle>
            <CardDescription>Comprehensive entity knowledge base</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              A curated database of labeled entities including exchanges, mixers, contracts, and known individuals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Entity Clustering
            </CardTitle>
            <CardDescription>Group related entities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Automatically or manually group entities based on behavior patterns and relationships.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Import & Export
            </CardTitle>
            <CardDescription>Share entity data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Import entity data from external sources or export your labeled entities for collaboration.
            </p>
          </CardContent>
        </Card>
      </div>

      <EntityAdvancedSearch onSearch={handleSearch} />

      <Tabs defaultValue="entities" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="entities">
            <Tag className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Entities</span>
          </TabsTrigger>
          <TabsTrigger value="clusters">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Clusters</span>
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Bulk Operations</span>
          </TabsTrigger>
          <TabsTrigger value="import-export">
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Import/Export</span>
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <Database className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-6">
          <EntityTable searchFilters={searchFilters} onEditEntity={handleEditEntity} />
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6">
          <EntityClusterView />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <EntityBulkOperations />
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <EntityImportExport />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <EntityStatistics />
        </TabsContent>
      </Tabs>

      {showLabelForm && (
        <EntityLabelForm entityId={selectedEntityId} isOpen={showLabelForm} onClose={handleFormClose} />
      )}
    </div>
  )
}
