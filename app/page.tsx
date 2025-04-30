"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If user is authenticated, redirect to dashboard
        router.push("/dashboard")
      } else {
        // If user is not authenticated, redirect to sign-in
        router.push("/auth/sign-in")
      }
    }
  }, [user, isLoading, router])
  
  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
