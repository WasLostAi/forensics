import { EntityManagementDashboard } from "@/components/entity-management-dashboard"

// Export as both named and default export to fix the deployment error
export function EntityManagementDashboardClient() {
  return <EntityManagementDashboard />
}

// Keep the default export for backward compatibility
export default EntityManagementDashboardClient
