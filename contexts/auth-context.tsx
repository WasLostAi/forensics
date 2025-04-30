"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAdmin: () => boolean
  walletAddress: string | null
  signOut: () => void
}

// Create a default context value
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  isAdmin: () => false,
  walletAddress: null,
  signOut: () => {},
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Check if user is authenticated
    const authToken = localStorage.getItem("auth_token")
    const storedWalletAddress = localStorage.getItem("wallet_address")
    const userRole = localStorage.getItem("user_role")

    if (authToken) {
      setUser({ email: "user@example.com", user_metadata: { wallet_address: storedWalletAddress } })
      setWalletAddress(storedWalletAddress)
    } else {
      setUser(null)
      setWalletAddress(null)
    }

    setIsLoading(false)
  }, [isMounted])

  const signOut = useCallback(() => {
    if (!isMounted) return

    localStorage.removeItem("auth_token")
    localStorage.removeItem("wallet_address")
    localStorage.removeItem("user_role")
    setUser(null)
    setWalletAddress(null)
  }, [isMounted])

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
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider")
  }
  return context
}
