"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFormProps {
  className?: string
  placeholder?: string
  buttonText?: string
  size?: "default" | "lg"
}

export default function SearchForm({
  className,
  placeholder = "Enter wallet address, transaction signature, or token...",
  buttonText = "Search",
  size = "default",
}: SearchFormProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)

    // Determine if the input is a wallet address, transaction signature, or token
    // This is a simple heuristic and could be improved
    if (query.length === 44 || query.length === 43) {
      // Likely a wallet address or transaction signature
      if (query.match(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/)) {
        // Check if it starts with a transaction signature pattern
        if (query.match(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/)) {
          router.push(`/transaction/${query}`)
        } else {
          router.push(`/wallet/${query}`)
        }
      } else {
        // Assume it's a token address
        router.push(`/token/${query}`)
      }
    } else {
      // Default to wallet search
      router.push(`/wallet/${query}`)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10 pr-24", size === "lg" && "h-12 text-lg rounded-lg pl-12 pr-32")}
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className={cn("absolute right-1 top-1/2 -translate-y-1/2", size === "lg" && "h-10 px-6")}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-1">◌</span> Searching
            </span>
          ) : (
            <span className="flex items-center">
              {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
