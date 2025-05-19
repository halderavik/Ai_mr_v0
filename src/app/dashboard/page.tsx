"use client"

import type React from "react"

import { useState } from "react"
import { Home, HelpCircle, Bell, User, Plus, BarChart3, PieChart, LineChart, Network } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const router = useRouter()
  const [query, setQuery] = useState("i want to run Van-Westendrop analysis")

  const analysisTools = [
    {
      id: 1,
      name: "Gabor Granger",
      description: "Price sensitivity analysis to determine optimal pricing",
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      path: "/analysis/gabor-granger",
    },
    {
      id: 2,
      name: "Driver Analysis",
      description: "Identify key factors driving customer satisfaction and loyalty",
      icon: <LineChart className="h-10 w-10 text-primary" />,
      path: "/analysis/driver-analysis",
    },
    {
      id: 3,
      name: "Segmentation",
      description: "Cluster analysis to identify distinct customer segments",
      icon: <PieChart className="h-10 w-10 text-primary" />,
      path: "/analysis/segmentation",
    },
    {
      id: 4,
      name: "Choice Based Conjoint",
      description: "Analyze feature preferences and willingness to pay",
      icon: <Network className="h-10 w-10 text-primary" />,
      path: "/analysis/conjoint",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to analysis page with the query
    router.push(`/analysis?query=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full bg-gray-900 text-white hover:bg-gray-800">
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Welcome back...</h1>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="What analysis would you like to run today?"
              className="h-14 rounded-full border-gray-300 px-6 text-lg shadow-sm focus:border-primary focus:ring-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" size="icon" className="absolute right-2 top-2 rounded-full">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Submit</span>
            </Button>
          </div>
        </form>

        {/* Analysis Tools */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {analysisTools.map((tool) => (
            <Link key={tool.id} href={tool.path}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">{tool.icon}</div>
                  <h3 className="mb-2 text-lg font-medium">{tool.name}</h3>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
