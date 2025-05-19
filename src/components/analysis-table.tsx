"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

// Sample data - in a real app, this would come from your analysis
const data = [
  { segment: "Segment A", size: "25%", avgSpend: "$125", satisfaction: 4.2, loyalty: "High" },
  { segment: "Segment B", size: "40%", avgSpend: "$85", satisfaction: 3.8, loyalty: "Medium" },
  { segment: "Segment C", size: "15%", avgSpend: "$210", satisfaction: 4.7, loyalty: "Very High" },
  { segment: "Segment D", size: "30%", avgSpend: "$65", satisfaction: 3.2, loyalty: "Low" },
  { segment: "Segment E", size: "20%", avgSpend: "$150", satisfaction: 4.0, loyalty: "High" },
]

export function AnalysisTable() {
  return (
    <Card className="h-full overflow-auto p-4">
      <div className="mb-4 text-center text-sm font-medium text-gray-700">Market Segment Analysis</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Segment</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Avg. Spend</TableHead>
            <TableHead>Satisfaction</TableHead>
            <TableHead>Loyalty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.segment}>
              <TableCell className="font-medium">{row.segment}</TableCell>
              <TableCell>{row.size}</TableCell>
              <TableCell>{row.avgSpend}</TableCell>
              <TableCell>{row.satisfaction}</TableCell>
              <TableCell>{row.loyalty}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
