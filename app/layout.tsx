import type React from "react"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Solana Forensics Toolkit",
  description: "A comprehensive tool for tracking and visualizing on-chain fund movements",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
