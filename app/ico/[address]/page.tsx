import { Suspense } from "react"
import { ICODetailView } from "@/components/ico-detail-view"
import { MonitoringService } from "@/lib/monitoring-service"
import { notFound } from "next/navigation"

export default async function ICODetailPage({ params }: { params: { address: string } }) {
  const { address } = params

  // Fetch the ICO project data
  const projects = await MonitoringService.getICOProjects()
  const project = projects.find((p) => p.address === address)

  if (!project) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="mt-8 text-center">Loading ICO details...</div>}>
        <ICODetailView project={project} />
      </Suspense>
    </main>
  )
}
