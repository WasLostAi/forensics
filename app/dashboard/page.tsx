import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, BarChart2, Tag, Bookmark, Shield, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard | Solana Forensic Toolkit",
  description: "Your Solana Forensic Toolkit dashboard",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Analysis</CardTitle>
            <CardDescription>Search and analyze wallet addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Perform in-depth analysis of any Solana wallet address, including transaction history, risk scoring, and
              entity identification.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">
                <Search className="mr-2 h-4 w-4" />
                Search Wallets
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Flow</CardTitle>
            <CardDescription>Visualize transaction flows</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Explore transaction flows between wallets with interactive visualizations, filters, and detailed
              analytics.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/transactions">
                <BarChart2 className="mr-2 h-4 w-4" />
                View Transactions
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entity Labels</CardTitle>
            <CardDescription>Manage entity labels</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create, edit, and manage entity labels for wallets, exchanges, and projects on the Solana blockchain.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/entities">
                <Tag className="mr-2 h-4 w-4" />
                Manage Entities
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investigations</CardTitle>
            <CardDescription>Your saved investigations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access your saved investigations, reports, and analysis workflows for ongoing forensic work.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/investigations">
                <Bookmark className="mr-2 h-4 w-4" />
                View Investigations
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Monitoring</CardTitle>
            <CardDescription>Monitor suspicious activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set up alerts and monitor suspicious activities, malicious wallets, and potential security threats.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/monitoring">
                <Shield className="mr-2 h-4 w-4" />
                Security Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your toolkit</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Manage your API credentials, preferences, and account settings for the Solana Forensic Toolkit.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Manage Settings
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
