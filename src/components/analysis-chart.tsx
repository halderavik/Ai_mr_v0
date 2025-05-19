"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card } from "@/components/ui/card"

// Sample data - in a real app, this would come from your analysis
const data = [
  { name: "Segment A", value: 25, color: "#38bdf8" },
  { name: "Segment B", value: 40, color: "#fb923c" },
  { name: "Segment C", value: 15, color: "#6366f1" },
  { name: "Segment D", value: 30, color: "#4ade80" },
  { name: "Segment E", value: 20, color: "#e879f9" },
]

export function AnalysisChart() {
  return (
    <Card className="h-full p-4">
      <div className="mb-4 text-center text-sm font-medium text-gray-700">Market Segment Distribution</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar dataKey="value" name="Value (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
