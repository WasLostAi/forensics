import type { Metadata } from "next"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletConnect } from "@/components/auth/wallet-connect"

export const metadata: Metadata = {
  title: "Sign In | Solana Forensic Toolkit",
  description: "Sign in to your Solana Forensic Toolkit account",
}

export default function SignInPage() {
  return (
    <AuthLayout>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="wallet">Solana Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <SignInForm />
        </TabsContent>
        <TabsContent value="wallet">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Sign In with Wallet</h1>
              <p className="text-muted-foreground">Connect your Solana wallet to access your account</p>
            </div>
            <WalletConnect />
          </div>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  )
}
