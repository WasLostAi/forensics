"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface SettingsContextType {
  rpcUrl: string
  setRpcUrl: (url: string) => void
  availableRpcs: { name: string; url: string; headers?: Record<string, string> }[]
  selectedRpcName: string
  setSelectedRpcName: (name: string) => void
}

const defaultRpcs = [
  {
    name: "Solana Public RPC",
    url: "https://api.mainnet-beta.solana.com",
    headers: { "Content-Type": "application/json" },
  },
  {
    name: "Project Serum RPC",
    url: "https://solana-api.projectserum.com",
    headers: { "Content-Type": "application/json" },
  },
  {
    name: "Ankr Public RPC",
    url: "https://rpc.ankr.com/solana",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://solana-forensics.vercel.app",
    },
  },
  { name: "Custom RPC", url: "" },
]

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [rpcUrl, setRpcUrl] = useState<string>(defaultRpcs[0].url)
  const [availableRpcs, setAvailableRpcs] = useState(defaultRpcs)
  const [selectedRpcName, setSelectedRpcName] = useState(defaultRpcs[0].name)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedRpcUrl = localStorage.getItem("rpcUrl")
      const savedRpcName = localStorage.getItem("selectedRpcName")

      if (savedRpcUrl) {
        setRpcUrl(savedRpcUrl)
      }

      if (savedRpcName) {
        setSelectedRpcName(savedRpcName)
      }

      // Handle custom RPC if saved
      const customRpc = localStorage.getItem("customRpc")
      if (customRpc) {
        const updatedRpcs = [...defaultRpcs]
        updatedRpcs[3].url = customRpc
        setAvailableRpcs(updatedRpcs)
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("rpcUrl", rpcUrl)
      localStorage.setItem("selectedRpcName", selectedRpcName)

      // Save custom RPC if selected
      if (selectedRpcName === "Custom RPC") {
        localStorage.setItem("customRpc", rpcUrl)

        // Update available RPCs
        const updatedRpcs = [...availableRpcs]
        updatedRpcs[3].url = rpcUrl
        setAvailableRpcs(updatedRpcs)
      }
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error)
    }
  }, [rpcUrl, selectedRpcName, availableRpcs])

  return (
    <SettingsContext.Provider
      value={{
        rpcUrl,
        setRpcUrl,
        availableRpcs,
        selectedRpcName,
        setSelectedRpcName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
