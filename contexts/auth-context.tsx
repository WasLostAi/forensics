"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAdmin: () => boolean
  walletAddress: string | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user || null)
        setWalletAddress(session?.user?.user_metadata?.wallet_address as string | null)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Subscribe to auth state changes
    const supabase = createClient()
    supabase.auth.onAuthStateChange(() => {
      loadUser()
    })
  }, [router])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("wallet_address")
    localStorage.removeItem("user_role")
    router.push("/auth/sign-in")
  }, [router])

  const isAdmin = useCallback(() => {
    return walletAddress === "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"
  }, [walletAddress])

  const value: AuthContextType = {
    user,
    isLoading,
    isAdmin,
    walletAddress,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider")
  }
  return context
}
