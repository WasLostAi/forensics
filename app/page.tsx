import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold">Solana Wallet Forensics</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Advanced blockchain analysis tools for security researchers, investigators, and compliance teams
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Transaction Flow Mapping</CardTitle>
              <CardDescription className="text-gray-400">Visualize fund movements across wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Interactive flow charts between wallets with filters for date and amount. Highlight critical paths and
                identify unusual patterns.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Explore Transactions</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Wallet Analysis</CardTitle>
              <CardDescription className="text-gray-400">Deep dive into wallet behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Track funding sources, analyze complete history of fund origins, and identify suspicious activity
                patterns.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/wallet" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Analyze Wallets</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Entity Labeling</CardTitle>
              <CardDescription className="text-gray-400">Identify and track entities</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Comprehensive database of known entities, exchanges, and projects. Automatically detect
                deposit/withdrawal patterns.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/entities" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">View Entities</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
