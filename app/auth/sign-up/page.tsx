import type { Metadata } from "next"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign Up | Solana Forensic Toolkit",
  description: "Create a new Solana Forensic Toolkit account",
}

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  )
}
