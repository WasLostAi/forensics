"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight, Search, BarChart2, Network, Tag, Share2 } from "lucide-react"

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
}

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    // Check if user has seen the tour before
    const tourSeen = localStorage.getItem("onboarding-tour-seen")
    if (!tourSeen) {
      setOpen(true)
    } else {
      setHasSeenTour(true)
    }
  }, [])

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Solana Wallet Forensics",
      description:
        "This tool helps you analyze Solana blockchain transactions, track fund movements, and identify suspicious activities. Let's take a quick tour of the main features.",
      icon: <Network className="h-8 w-8 text-primary" />,
    },
    {
      title: "Search for Wallets",
      description:
        "Start by searching for a wallet address, transaction ID, or token address. You can analyze any Solana wallet to trace transactions and identify patterns.",
      icon: <Search className="h-8 w-8 text-primary" />,
    },
    {
      title: "Transaction Flow Visualization",
      description:
        "Visualize how funds move between wallets with our interactive transaction flow graph. Critical paths are highlighted in red to identify suspicious movements.",
      icon: <Network className="h-8 w-8 text-primary" />,
    },
    {
      title: "Funding Source Analysis",
      description:
        "Track the origin of funds in any wallet with detailed funding source analysis. Identify high-risk sources and understand fund distribution.",
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
    },
    {
      title: "Entity Labeling",
      description:
        "Label wallets as exchanges, individuals, or other entities. Our database includes known exchanges and projects for automatic identification.",
      icon: <Tag className="h-8 w-8 text-primary" />,
    },
    {
      title: "Export and Share",
      description:
        "Export your findings as PDF or CSV reports, and share investigations with team members for collaborative analysis.",
      icon: <Share2 className="h-8 w-8 text-primary" />,
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // End of tour
      setOpen(false)
      localStorage.setItem("onboarding-tour-seen", "true")
      setHasSeenTour(true)
    }
  }

  const handleSkip = () => {
    setOpen(false)
    localStorage.setItem("onboarding-tour-seen", "true")
    setHasSeenTour(true)
  }

  const resetTour = () => {
    localStorage.removeItem("onboarding-tour-seen")
    setHasSeenTour(false)
    setCurrentStep(0)
    setOpen(true)
  }

  return (
    <>
      {hasSeenTour && (
        <Button variant="outline" size="sm" onClick={resetTour} className="fixed bottom-4 right-4 z-50">
          Show Tour
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {steps[currentStep].icon}
            </div>
            <DialogTitle className="text-center text-xl pt-4">{steps[currentStep].title}</DialogTitle>
            <DialogDescription className="text-center pt-2">{steps[currentStep].description}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Get Started <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
