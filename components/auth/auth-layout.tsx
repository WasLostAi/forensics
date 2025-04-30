import type React from "react"
import { Network } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <Network className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">SolanaForensics</span>
            </div>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="max-w-2xl text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Solana Forensic Analysis</h2>
              <p className="text-xl">
                Advanced blockchain analytics and forensic tools for security researchers, investigators, and compliance
                teams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
