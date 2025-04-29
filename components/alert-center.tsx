"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Bell } from "lucide-react"

// Mock data for demonstration
const alerts = [
  {
    id: "1",
    title: "Suspicious Wallet Creation",
    description: "Wallet 8xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW9QHXhU9 created with high risk score",
    severity: "high",
    timestamp: "2023-11-28T09:12:33Z",
  },
  {
    id: "2",
    title: "Potential Rug Pull Token",
    description: "Token QuickGainToken created with suspicious indicators",
    severity: "high",
    timestamp: "2023-11-27T18:45:12Z",
  },
  {
    id: "3",
    title: "Unusual ICO Launch",
    description: "ICO NewProject ICO detected with high bot activity",
    severity: "medium",
    timestamp: "2023-11-26T14:23:45Z",
  },
  {
    id: "4",
    title: "Suspicious Transaction Pattern",
    description:
      "Wallet 5KjQNXwTBLJH9qYLU7G5mdGQgMVp9jhvQ1D5XZtXRnKQT8sm3Yb4ZvYZ3z8ZQM1v9Fxv2jQKFJzVQZCzZvKjWRLN exhibiting unusual transaction behavior",
    severity: "medium",
    timestamp: "2023-11-25T09:12:33Z",
  },
  {
    id: "5",
    title: "Low Risk ICO Verified",
    description: "Legitimate ICO verified with KYC and audit",
    severity: "low",
    timestamp: "2023-11-24T18:45:12Z",
  },
]

export function AlertCenter() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter alerts based on search query
  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Alert Center</h2>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Configure Alerts
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search alerts..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-genos">Recent Alerts</CardTitle>
          <CardDescription>Real-time alerts on suspicious activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg soft-border overflow-hidden bg-card/80 backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No alerts matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="text-muted-foreground">{alert.description}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(alert.severity)}>{alert.severity}</Badge>
                      </TableCell>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
