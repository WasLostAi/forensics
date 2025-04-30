"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()
  const { user, isLoading, userRole } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user || userRole === "judge") {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [isLoading, user, userRole, router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
}
