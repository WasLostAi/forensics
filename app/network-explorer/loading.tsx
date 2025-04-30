import { Loader2 } from "lucide-react"

export default function NetworkExplorerLoading() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Entity Network Explorer</h1>
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading network explorer...</p>
        </div>
      </div>
    </div>
  )
}
