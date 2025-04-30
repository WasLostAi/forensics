import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, TrendingUp, Network, File, AlertTriangle, Tag } from "lucide-react"
import SearchForm from "@/components/search-form"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-muted py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Solana Forensics Toolkit
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Advanced blockchain analysis tools for Solana investigators, compliance teams, and security
                  researchers.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="inline-flex gap-1" asChild>
                  <Link href="/wallet">
                    Start Investigation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/entities">Entity Database</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last">
              <Image
                src="/placeholder.svg?key=rmrqi"
                alt="Solana Forensics Platform"
                width={800}
                height={400}
                priority
                className="rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="mx-auto flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Track Any Solana Wallet or Transaction
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Enter a Solana wallet address, transaction signature, or token to begin your forensic analysis.
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <SearchForm />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our comprehensive toolkit provides everything you need for advanced Solana forensic analysis.
            </p>
          </div>
          <div className="mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8 max-w-5xl">
            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">Transaction Flow Mapping</CardTitle>
                <CardDescription>Visualize the flow of funds between wallets with interactive charts.</CardDescription>
              </CardHeader>
              <CardContent>
                Track how funds move across the Solana ecosystem with customizable filters for dates and amounts.
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href="/transactions" className="flex items-center">
                    Explore Transaction Flows <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Network className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">Transaction Clustering</CardTitle>
                <CardDescription>
                  Group related transactions to identify patterns and associated wallets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                Advanced algorithms detect relationships between transactions and wallets to uncover hidden connections.
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href="/wallet" className="flex items-center">
                    View Cluster Analysis <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">Entity Labeling</CardTitle>
                <CardDescription>Comprehensive database of known Solana entities and wallets.</CardDescription>
              </CardHeader>
              <CardContent>
                Identify exchanges, projects, and other entities across the Solana ecosystem with our continually
                updated database.
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href="/entities" className="flex items-center">
                    Explore Entity Database <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">Risk Scoring</CardTitle>
                <CardDescription>Assess wallet and transaction risk with multi-factor analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                Sophisticated algorithms evaluate multiple risk factors to provide comprehensive risk assessments for
                wallets and transactions.
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href="/wallet" className="flex items-center">
                    View Risk Analysis <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">Monitoring Dashboard</CardTitle>
                <CardDescription>Real-time alerts for suspicious on-chain activities.</CardDescription>
              </CardHeader>
              <CardContent>
                Set up custom alerts for suspicious transactions, new token launches, and unusual activity from
                monitored wallets.
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href="/monitoring" className="flex items-center">
                    Setup Monitoring <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">Investigation Management</CardTitle>
                <CardDescription>Create and manage detailed forensic investigations.</CardDescription>
              </CardHeader>
              <CardContent>
                Organize your findings, share with team members, and generate comprehensive reports for compliance or
                legal purposes.
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href="/investigations" className="flex items-center">
                    Manage Investigations <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Start Your Investigation?</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Begin your Solana forensic analysis with our comprehensive toolkit.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="inline-flex gap-1" asChild>
                <Link href="/wallet">
                  Start Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/settings">Configure Settings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
