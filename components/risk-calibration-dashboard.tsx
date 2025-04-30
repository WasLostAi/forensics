"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import type { RiskThresholdConfig } from "@/types/risk"

interface RiskCalibrationDashboardProps {
  onSaveConfig?: (config: RiskThresholdConfig) => void
}

export function RiskCalibrationDashboard({ onSaveConfig }: RiskCalibrationDashboardProps) {
  // Risk threshold configuration
  const [config, setConfig] = useState<RiskThresholdConfig>({
    highRiskThreshold: 70,
    mediumRiskThreshold: 35,
    largeTransactionThreshold: 1000,
    unusualVelocityThreshold: 50,
    mixerInteractionWeight: 30,
    circularPatternWeight: 18,
  })

  // Calibration metrics
  const [metrics, setMetrics] = useState({
    falsePositives: 12,
    falseNegatives: 8,
    accuracy: 84,
    precision: 86,
    recall: 82,
    f1Score: 84,
  })

  // Sample data for visualization
  const [sampleData, setSampleData] = useState({
    knownHighRiskWallets: 50,
    knownMediumRiskWallets: 120,
    knownLowRiskWallets: 230,
    correctlyClassified: 336,
    incorrectlyClassified: 64,
  })

  // UI state
  const [activeTab, setActiveTab] = useState("thresholds")
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationResult, setCalibrationResult] = useState<string | null>(null)

  // Handle config changes
  const handleConfigChange = (key: keyof RiskThresholdConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Reset to default configuration
  const resetToDefaults = () => {
    setConfig({
      highRiskThreshold: 70,
      mediumRiskThreshold: 35,
      largeTransactionThreshold: 1000,
      unusualVelocityThreshold: 50,
      mixerInteractionWeight: 30,
      circularPatternWeight: 18,
    })
  }

  // Save configuration
  const saveConfiguration = () => {
    if (onSaveConfig) {
      onSaveConfig(config)
    }
    setCalibrationResult("Configuration saved successfully!")
    setTimeout(() => setCalibrationResult(null), 3000)
  }

  // Run calibration
  const runCalibration = async () => {
    setIsCalibrating(true)
    setCalibrationResult(null)

    try {
      // Simulate calibration process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update metrics based on new configuration
      // In a real implementation, this would run the risk scoring algorithm on a test dataset
      // and compare the results with known risk levels
      const newFalsePositives = Math.max(5, Math.floor(12 - (config.highRiskThreshold - 70) / 5))
      const newFalseNegatives = Math.max(3, Math.floor(8 - (35 - config.mediumRiskThreshold) / 10))

      const totalSamples =
        sampleData.knownHighRiskWallets + sampleData.knownMediumRiskWallets + sampleData.knownLowRiskWallets
      const correctlyClassified = totalSamples - (newFalsePositives + newFalseNegatives)
      const accuracy = Math.round((correctlyClassified / totalSamples) * 100)

      const precision = Math.round(
        ((sampleData.knownHighRiskWallets - newFalsePositives) /
          (sampleData.knownHighRiskWallets - newFalsePositives + newFalseNegatives)) *
          100,
      )

      const recall = Math.round(
        ((sampleData.knownHighRiskWallets - newFalseNegatives) / sampleData.knownHighRiskWallets) * 100,
      )

      const f1Score = Math.round((2 * (precision * recall)) / (precision + recall))

      setMetrics({
        falsePositives: newFalsePositives,
        falseNegatives: newFalseNegatives,
        accuracy,
        precision,
        recall,
        f1Score,
      })

      setSampleData((prev) => ({
        ...prev,
        correctlyClassified,
        incorrectlyClassified: totalSamples - correctlyClassified,
      }))

      setCalibrationResult("Calibration completed successfully!")
    } catch (error) {
      console.error("Calibration error:", error)
      setCalibrationResult("Error during calibration. Please try again.")
    } finally {
      setIsCalibrating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Risk Scoring Calibration</span>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
                <TabsTrigger value="weights">Weights</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
          <CardDescription>
            Calibrate risk scoring algorithms with real-world data to improve accuracy and reduce false positives
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "thresholds" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="highRiskThreshold">High Risk Threshold</Label>
                    <span className="text-sm font-medium">{config.highRiskThreshold}</span>
                  </div>
                  <Slider
                    id="highRiskThreshold"
                    min={50}
                    max={90}
                    step={1}
                    value={[config.highRiskThreshold]}
                    onValueChange={(value) => handleConfigChange("highRiskThreshold", value[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Wallets with risk scores above this threshold are classified as high risk.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="mediumRiskThreshold">Medium Risk Threshold</Label>
                    <span className="text-sm font-medium">{config.mediumRiskThreshold}</span>
                  </div>
                  <Slider
                    id="mediumRiskThreshold"
                    min={20}
                    max={60}
                    step={1}
                    value={[config.mediumRiskThreshold]}
                    onValueChange={(value) => handleConfigChange("mediumRiskThreshold", value[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Wallets with risk scores above this threshold are classified as medium risk.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="largeTransactionThreshold">Large Transaction Threshold (SOL)</Label>
                    <span className="text-sm font-medium">{config.largeTransactionThreshold}</span>
                  </div>
                  <Slider
                    id="largeTransactionThreshold"
                    min={100}
                    max={10000}
                    step={100}
                    value={[config.largeTransactionThreshold]}
                    onValueChange={(value) => handleConfigChange("largeTransactionThreshold", value[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Transactions above this amount are considered large and may trigger additional scrutiny.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="unusualVelocityThreshold">Unusual Velocity Threshold (tx/hour)</Label>
                    <span className="text-sm font-medium">{config.unusualVelocityThreshold}</span>
                  </div>
                  <Slider
                    id="unusualVelocityThreshold"
                    min={10}
                    max={200}
                    step={5}
                    value={[config.unusualVelocityThreshold]}
                    onValueChange={(value) => handleConfigChange("unusualVelocityThreshold", value[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Transaction rates above this threshold are considered unusual.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset to Defaults
                </Button>
                <Button onClick={saveConfiguration}>Save Configuration</Button>
              </div>
            </div>
          )}

          {activeTab === "weights" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="mixerInteractionWeight">Mixer Interaction Weight</Label>
                    <span className="text-sm font-medium">{config.mixerInteractionWeight}</span>
                  </div>
                  <Slider
                    id="mixerInteractionWeight"
                    min={0}
                    max={50}
                    step={1}
                    value={[config.mixerInteractionWeight]}
                    onValueChange={(value) => handleConfigChange("mixerInteractionWeight", value[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight applied to interactions with known mixer services.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="circularPatternWeight">Circular Pattern Weight</Label>
                    <span className="text-sm font-medium">{config.circularPatternWeight}</span>
                  </div>
                  <Slider
                    id="circularPatternWeight"
                    min={0}
                    max={30}
                    step={1}
                    value={[config.circularPatternWeight]}
                    onValueChange={(value) => handleConfigChange("circularPatternWeight", value[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Weight applied to circular transaction patterns.</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset to Defaults
                </Button>
                <Button onClick={saveConfiguration}>Save Configuration</Button>
              </div>
            </div>
          )}

          {activeTab === "results" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.accuracy}%</div>
                    <p className="text-xs text-muted-foreground">Overall classification accuracy</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Precision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.precision}%</div>
                    <p className="text-xs text-muted-foreground">True positives / (True positives + False positives)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Recall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.recall}%</div>
                    <p className="text-xs text-muted-foreground">True positives / (True positives + False negatives)</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>False Positives</span>
                  <Badge variant="destructive">{metrics.falsePositives}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>False Negatives</span>
                  <Badge variant="destructive">{metrics.falseNegatives}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>F1 Score</span>
                  <Badge variant="outline">{metrics.f1Score}%</Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={runCalibration} disabled={isCalibrating} className="w-full">
                  {isCalibrating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Calibrating...
                    </>
                  ) : (
                    "Run Calibration"
                  )}
                </Button>
              </div>

              {calibrationResult && (
                <div
                  className={`mt-4 p-3 rounded-md flex items-center ${
                    calibrationResult.includes("Error")
                      ? "bg-destructive/10 text-destructive"
                      : "bg-green-500/10 text-green-500"
                  }`}
                >
                  {calibrationResult.includes("Error") ? (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {calibrationResult}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
