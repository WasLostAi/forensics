import { Skeleton } from "@/components/ui/skeleton"

export default function CollaboratorsLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
