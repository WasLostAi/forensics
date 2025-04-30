"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { shortenAddress } from "@/lib/utils"

interface HolderDistributionProps {
  tokenAddress: string
  holders: string[]
}

export function HolderDistribution({ tokenAddress, holders }: HolderDistributionProps) {
  // In a real implementation, you would fetch token balances for each holder
  // For now, we'll use mock data

  const mockData = [
    { name: shortenAddress(holders[0] || "wallet1"), value: 45 },
    { name: shortenAddress(holders[1] || "wallet2"), value: 25 },
    { name: shortenAddress(holders[2] || "wallet3"), value: 15 },
    { name: shortenAddress(holders[3] || "wallet4"), value: 10 },
    { name: "Others", value: 5 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ChartContainer
          config={{
            holder1: {
              label: mockData[0].name,
              color: COLORS[0],
            },
            holder2: {
              label: mockData[1].name,
              color: COLORS[1],
            },
            holder3: {
              label: mockData[2].name,
              color: COLORS[2],
            },
            holder4: {
              label: mockData[3].name,
              color: COLORS[3],
            },
            others: {
              label: "Others",
              color: COLORS[4],
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Holder Concentration Analysis</h4>
        <p className="text-sm text-muted-foreground">
          {mockData[0].value > 40
            ? "Warning: High concentration of tokens in a single wallet (>40%)"
            : "Token distribution appears relatively balanced among holders"}
        </p>
      </div>
    </div>
  )
}
