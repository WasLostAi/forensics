import type { Metadata } from "next"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In | Solana Forensic Toolkit",
  description: "Sign in to your Solana Forensic Toolkit account",
}

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  )
}
