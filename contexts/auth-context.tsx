"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// Admin wallet address
const ADMIN_WALLET_ADDRESS = "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"

type UserRole = "user" | "admin"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  userRole: UserRole
  walletAddress: string | null
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
    success: boolean
  }>
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
    success: boolean
  }>
  signInWithWallet: (walletAddress: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>("user")
  const router = useRouter()

  // Check if the user is an admin based on wallet address
  const isAdmin = () => {
    return walletAddress === ADMIN_WALLET_ADDRESS
  }

  // Update user role when wallet address changes
  useEffect(() => {
    if (walletAddress === ADMIN_WALLET_ADDRESS) {
      setUserRole("admin")
    } else {
      setUserRole("user")
    }
  }, [walletAddress])

  useEffect(() => {
    const setData = async () => {
      try {
        // Get session from Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error(error)
          setIsLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        // If user exists, check for wallet address in metadata
        if (session?.user) {
          const walletAddr = session.user.user_metadata?.wallet_address as string | undefined
          if (walletAddr) {
            setWalletAddress(walletAddr)
            if (walletAddr === ADMIN_WALLET_ADDRESS) {
              setUserRole("admin")
            }
          }

          // Get user profile from database
          const { data: profile } = await supabase
            .from("profiles")
            .select("wallet_address")
            .eq("id", session.user.id)
            .single()

          if (profile?.wallet_address) {
            setWalletAddress(profile.wallet_address)
            if (profile.wallet_address === ADMIN_WALLET_ADDRESS) {
              setUserRole("admin")
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error setting auth data:", error)
        setIsLoading(false)
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Update wallet address from session if available
      if (session?.user) {
        const walletAddr = session.user.user_metadata?.wallet_address as string | undefined
        if (walletAddr) {
          setWalletAddress(walletAddr)
          if (walletAddr === ADMIN_WALLET_ADDRESS) {
            setUserRole("admin")
          } else {
            setUserRole("user")
          }
        }
      } else {
        setWalletAddress(null)
        setUserRole("user")
      }
    })

    setData()

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error, success: false }
      }

      router.push("/dashboard")
      return { error: null, success: true }
    } catch (error) {
      return { error: error as Error, success: false }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error, success: false }
      }

      return { error: null, success: true }
    } catch (error) {
      return { error: error as Error, success: false }
    }
  }

  const signInWithWallet = async (walletAddress: string) => {
    try {
      // First check if this wallet is already associated with a user
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("wallet_address", walletAddress)
        .single()

      if (existingUser) {
        // If user exists, sign in with custom token (in a real implementation)
        // For now, we'll use a simplified approach
        const { data, error } = await supabase.auth.signInWithPassword({
          // Use a placeholder email based on wallet address
          email: `${walletAddress.substring(0, 8)}@solana-wallet.user`,
          password: "wallet-auth-placeholder",
        })

        if (error) {
          // If the user exists but credentials don't work, create a session manually
          // This is a simplified approach - in production, use proper wallet signatures
          const { data, error } = await supabase.auth.signUp({
            email: `${walletAddress.substring(0, 8)}@solana-wallet.user`,
            password: "wallet-auth-placeholder",
            options: {
              data: {
                wallet_address: walletAddress,
              },
            },
          })

          if (error) {
            return { error, success: false }
          }
        }
      } else {
        // Create a new user with this wallet
        const { data, error } = await supabase.auth.signUp({
          email: `${walletAddress.substring(0, 8)}@solana-wallet.user`,
          password: "wallet-auth-placeholder",
          options: {
            data: {
              wallet_address: walletAddress,
            },
          },
        })

        if (error) {
          return { error, success: false }
        }

        // Create profile entry
        await supabase.from("profiles").insert({
          id: data.user?.id,
          wallet_address: walletAddress,
          updated_at: new Date().toISOString(),
        })
      }

      setWalletAddress(walletAddress)

      // Set admin role if this is the admin wallet
      if (walletAddress === ADMIN_WALLET_ADDRESS) {
        setUserRole("admin")
      }

      router.push("/dashboard")
      return { error: null, success: true }
    } catch (error) {
      console.error("Wallet sign in error:", error)
      return { error: error as Error, success: false }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setWalletAddress(null)
    setUserRole("user")
    router.push("/")
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { error, success: false }
      }

      return { error: null, success: true }
    } catch (error) {
      return { error: error as Error, success: false }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    userRole,
    walletAddress,
    signIn,
    signUp,
    signInWithWallet,
    signOut,
    resetPassword,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
