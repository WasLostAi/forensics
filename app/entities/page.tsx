"use client"

import { EntityLabelManagement } from "@/components/entity-label-management"

export default function EntitiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Entity Label Management</h1>
      <EntityLabelManagement />
    </div>
  )
}
