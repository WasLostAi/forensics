import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Transaction Search</h1>
        <p className="text-muted-foreground">Search for any Solana transaction by signature</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Enter a transaction signature to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Enter transaction signature..." className="pl-8" />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              <div className="rounded-md border p-4">
                <h4 className="font-medium font-mono text-sm truncate">
                  5UfgccYAMxNQYxpQBHe9RdpBkZgmqWjYtQDvERXJqRHRuxL9JvEEjvJU9WUbwLYh1XkRTbYV8yvfYNUPULuYG5qn
                </h4>
                <p className="text-sm text-muted-foreground mt-1">March 15, 2023 14:23:45</p>
                <div className="flex justify-end mt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/transaction/5UfgccYAMxNQYxpQBHe9RdpBkZgmqWjYtQDvERXJqRHRuxL9JvEEjvJU9WUbwLYh1XkRTbYV8yvfYNUPULuYG5qn">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="font-medium font-mono text-sm truncate">
                  4Zg6MQeGWcwEcVgHQEiRjjNyYX3bhvEKVKEFy1K1JJwfJbmr2eVXU9JR1XvfaaJ1xJpheL7xjQA6QjrZfARzDUuY
                </h4>
                <p className="text-sm text-muted-foreground mt-1">March 14, 2023 09:12:33</p>
                <div className="flex justify-end mt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/transaction/4Zg6MQeGWcwEcVgHQEiRjjNyYX3bhvEKVKEFy1K1JJwfJbmr2eVXU9JR1XvfaaJ1xJpheL7xjQA6QjrZfARzDUuY">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h4 className="font-medium font-mono text-sm truncate">
                  3Tz7NEHK9HRZrM8kSBzSZgc5wPJXQ2K5aSRe9LiGBx8VuiXQUEVmxHRVcnf1ySNJm6FSHhfYMvZ2tEJXU2c8YRWJ
                </h4>
                <p className="text-sm text-muted-foreground mt-1">March 13, 2023 18:45:12</p>
                <div className="flex justify-end mt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/transaction/3Tz7NEHK9HRZrM8kSBzSZgc5wPJXQ2K5aSRe9LiGBx8VuiXQUEVmxHRVcnf1ySNJm6FSHhfYMvZ2tEJXU2c8YRWJ">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
