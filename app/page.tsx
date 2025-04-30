"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { SearchForm } from "@/components/search-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Network, Tag, BarChart2 } from "lucide-react"
import Link from "next/link"
import { SolanaLogo } from "@/components/solana-logo"
import { FeatureChecklist } from "@/components/feature-checklist"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-center mb-6">
          <SolanaLogo height={40} subtitle="Monitoring | Forensics" />
        </div>
        <p className="text-center text-muted-foreground">
          A comprehensive tool for tracking and visualizing on-chain fund movements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#9945FF]/20 hover:border-[#9945FF]/40 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-genos flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#9945FF]" />
              Wallet Analysis
            </CardTitle>
            <CardDescription>Analyze any Solana wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track transaction history, balance changes, and risk factors for any Solana wallet address.
            </p>
            <Button asChild className="w-full bg-[#9945FF] hover:bg-[#9945FF]/90">
              <Link href="/wallet">Analyze Wallet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#14F195]/20 hover:border-[#14F195]/40 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-genos flex items-center gap-2">
              <Network className="h-5 w-5 text-[#14F195]" />
              Transaction Flow
            </CardTitle>
            <CardDescription>Visualize fund movements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive visualization of how funds move between wallets with critical path highlighting.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-[#14F195]/50 text-[#14F195] hover:bg-[#14F195]/10"
            >
              <Link href="/wallet?tab=flow">View Flows</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#9945FF]/20 hover:border-[#9945FF]/40 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-genos flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#9945FF]" />
              Entity Labels
            </CardTitle>
            <CardDescription>Identify wallet entities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Label and identify exchanges, projects, and other entities across the Solana ecosystem.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-[#9945FF]/50 text-[#9945FF] hover:bg-[#9945FF]/10"
            >
              <Link href="/wallet?tab=entities">Browse Entities</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#14F195]/20 hover:border-[#14F195]/40 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-genos flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#14F195]" />
              Analytics
            </CardTitle>
            <CardDescription>Advanced metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed analytics on transaction patterns, funding sources, and suspicious activities.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-[#14F195]/50 text-[#14F195] hover:bg-[#14F195]/10"
            >
              <Link href="/wallet?tab=funding">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-genos">Quick Search</CardTitle>
          <CardDescription>Enter a Solana wallet address, transaction ID, or token address</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-20 flex items-center justify-center">Loading search...</div>}>
            <SearchForm />
          </Suspense>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-genos">Recent Investigations</CardTitle>
            <CardDescription>Your recently saved investigations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border border-[#9945FF]/20 p-4">
                <h3 className="font-medium">Suspicious Exchange Activity</h3>
                <p className="text-sm text-muted-foreground mt-1">Last updated: 2 hours ago</p>
              </div>
              <div className="rounded-md border border-[#14F195]/20 p-4">
                <h3 className="font-medium">Potential Rugpull Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">Last updated: Yesterday</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/investigations">View All Investigations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-genos">Getting Started</CardTitle>
            <CardDescription>Learn how to use Solana Wallet Forensics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium">1. Search for a wallet address</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter any Solana wallet address to begin your investigation
                </p>
              </div>
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium">2. Analyze transaction flows</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualize how funds move between wallets and identify suspicious patterns
                </p>
              </div>
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium">3. Export and share findings</h3>
                <p className="text-sm text-muted-foreground mt-1">Generate reports and collaborate with your team</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">View Documentation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <FeatureChecklist />
      </div>
    </div>
  )
}
