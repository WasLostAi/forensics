import Image from "next/image"
import Link from "next/link"
import { SolanaLogo } from "@/components/solana-logo"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <Link href="/" className="mb-8 flex items-center">
          <SolanaLogo className="h-10 w-10 mr-2" />
          <span className="text-2xl font-bold">Solana Forensics</span>
        </Link>
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-border/40 bg-card p-6 shadow-lg">
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Solana Forensics. All rights reserved.
        </p>
      </div>
    </div>
  )
}
