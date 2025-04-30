import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function BulkEntityOperationsLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-[300px]" />
        <Skeleton className="h-5 w-[450px]" />
      </div>

      <Tabs defaultValue="labeling" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="labeling" disabled>
            Bulk Labeling
          </TabsTrigger>
          <TabsTrigger value="operations" disabled>
            Other Operations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="labeling" className="mt-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[350px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[200px]" />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
