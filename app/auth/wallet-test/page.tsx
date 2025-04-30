import { WalletAuthTest } from "@/components/auth/wallet-auth-test"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wallet Authentication Test | Solana Forensic Toolkit",
  description: "Test the Solana wallet authentication flow",
}

export default function WalletTestPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-6">Wallet Authentication Test</h1>
      <WalletAuthTest />
    </div>
  )
}
