import type { Metadata } from "next"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | Solana Forensic Toolkit",
  description: "Reset your Solana Forensic Toolkit password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
