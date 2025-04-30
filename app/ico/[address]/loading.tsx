export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <div className="h-8 w-1/3 animate-pulse rounded-md bg-muted"></div>
        <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted"></div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 animate-pulse rounded-md bg-muted"></div>
          <div className="h-40 animate-pulse rounded-md bg-muted"></div>
          <div className="h-40 animate-pulse rounded-md bg-muted"></div>
        </div>

        <div className="mt-6 h-80 animate-pulse rounded-md bg-muted"></div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 animate-pulse rounded-md bg-muted"></div>
          <div className="h-60 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    </div>
  )
}
