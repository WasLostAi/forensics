"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Network, Github, Home, Wallet, FileText, Bell, Shield, AlertTriangle } from "lucide-react"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Wallet Analysis", href: "/wallet", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: FileText },
  { name: "Investigations", href: "/investigations", icon: Network },
  { name: "Monitoring", href: "/monitoring", icon: Bell },
  { name: "Advanced Monitoring", href: "/advanced-monitoring", icon: AlertTriangle },
  { name: "Entities", href: "/entities", icon: Shield },
]

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Network className="h-5 w-5" />
          <span>SolanaForensics</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-2 text-sm font-medium">
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="https://github.com/username/solana-forensics" target="_blank">
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
