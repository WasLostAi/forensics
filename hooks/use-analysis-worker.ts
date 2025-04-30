"use client"

import { useState, useEffect } from "react"
import type { TransactionFlowData } from "@/types/transaction"

type WorkerCommand =
  | { type: "analyze_transaction_flow"; data: TransactionFlowData }
  | { type: "identify_clusters"; data: TransactionFlowData }
  | { type: "calculate_risk_score"; data: { walletData: any; flowData: TransactionFlowData } }

type WorkerResult =
  | { type: "analysis_result"; data: any }
  | { type: "clusters_result"; data: any }
  | { type: "risk_score_result"; data: number }
  | { type: "error"; message: string }

export function useAnalysisWorker() {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  // Initialize worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create worker only in browser environment
      try {
        const newWorker = new Worker(new URL("../workers/analysis-worker.ts", import.meta.url))

        newWorker.onmessage = (event: MessageEvent<WorkerResult>) => {
          const { type, data, message } = event.data

          setIsProcessing(false)

          if (type === "error") {
            setError(message || "Unknown error in worker")
            return
          }

          setResult(data)
        }

        newWorker.onerror = (error) => {
          console.error("Worker error:", error)
          setIsProcessing(false)
          setError("Error in analysis worker")
        }

        setWorker(newWorker)
      } catch (err) {
        console.error("Failed to create worker:", err)
        setError("Failed to initialize analysis worker")
      }
    }

    // Clean up worker on unmount
    return () => {
      if (worker) {
        worker.terminate()
      }
    }
  }, [])

  // Function to send command to worker
  const sendCommand = (command: WorkerCommand) => {
    if (!worker) {
      setError("Analysis worker not available")
      return false
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      worker.postMessage(command)
      return true
    } catch (err) {
      console.error("Error sending command to worker:", err)
      setIsProcessing(false)
      setError("Failed to send command to worker")
      return false
    }
  }

  return {
    sendCommand,
    isProcessing,
    error,
    result,
  }
}
