"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Home, Plus, Folder, Download, FileUp, Send, BarChart2, Table, FileText, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AnalysisChart } from "@/components/analysis-chart"
import { AnalysisTable } from "@/components/analysis-table"
import { AnalysisInsights } from "@/components/analysis-insights"
import { FileUploader } from "@/components/file-uploader"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MetadataTable {
  [key: string]: any;
}

interface PreviewData {
  dataset_id: string;
  filename: string;
  preview_rows: any[];
  metadata: MetadataTable | null;
}

export default function AnalysisPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query") || ""

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(
    initialQuery ? [{ role: "user", content: initialQuery }] : [],
  )
  const [input, setInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("chart")
  const [showUploader, setShowUploader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const newMessages = [...messages, { role: "user" as const, content: input }]
    setMessages(newMessages)
    setInput("")

    // Simulate AI response (in a real app, this would call your AI service)
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content:
            "I've analyzed your request and generated the results. You can view the chart and table outputs in the visualization panel, and check the insights section for business recommendations.",
        },
      ])
      scrollToBottom()
    }, 1000)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setPreviewData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreviewData(null);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMetadataTable = (metadata: MetadataTable | null) => {
    if (!metadata) return null;

    // Skip the full_meta_dict as it's already included in other fields
    const { full_meta_dict, ...displayMetadata } = metadata;

    return (
      <div className="space-y-4">
        {Object.entries(displayMetadata).map(([key, value]) => {
          // Skip if value is null or undefined
          if (value == null) return null;

          // Handle different types of metadata
          let displayValue: any;
          if (typeof value === "object") {
            if (Array.isArray(value)) {
              displayValue = value.join(", ");
            } else {
              displayValue = Object.entries(value)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");
            }
          } else {
            displayValue = value;
          }

          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold capitalize">
                  {key.replace(/_/g, " ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="whitespace-pre-wrap">
                        {displayValue}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDataTable = (data: any[]) => {
    if (!data.length) return null;

    const columns = Object.keys(data[0]);

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column}`}>
                    {row[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-16 flex-col items-center border-r bg-white py-4">
        <Button variant="ghost" size="icon" className="mb-6 rounded-full bg-gray-900 text-white hover:bg-gray-800">
          <Home className="h-5 w-5" />
          <span className="sr-only">Home</span>
        </Button>
        <Button variant="ghost" size="icon" className="mb-2">
          <Plus className="h-5 w-5" />
          <span className="sr-only">New Chat</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Folder className="h-5 w-5" />
          <span className="sr-only">Projects</span>
        </Button>
        <div className="mt-auto">
          <Button variant="ghost" size="icon" className="rounded-full">
            <FileUp className="h-5 w-5" onClick={() => setShowUploader(true)} />
            <span className="sr-only">Upload File</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={60} className="p-4">
            <Card className="flex h-full flex-col">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-lg font-medium">Chat Interface</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-4 h-full">
                <div className="flex flex-col space-y-4 h-full overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    placeholder="Ask about your data or request an analysis..."
                    className="min-h-[60px] flex-1 resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="h-[60px] w-[60px]">
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle>
            <div className="flex h-4 w-4 items-center justify-center">
              <GripVertical className="h-4 w-4" />
            </div>
          </ResizableHandle>

          {/* Analysis Panel */}
          <ResizablePanel defaultSize={70} className="p-4">
            <div className="flex h-full flex-col gap-4">
              {/* Visualization Panel */}
              <Card className="flex-1">
                <CardHeader className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Graphs and Tables</CardTitle>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                      <TabsList className="grid w-[180px] grid-cols-2">
                        <TabsTrigger value="chart">
                          <BarChart2 className="mr-2 h-4 w-4" />
                          Chart
                        </TabsTrigger>
                        <TabsTrigger value="table">
                          <Table className="mr-2 h-4 w-4" />
                          Table
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsContent value="chart" className="mt-0">
                      <div className="relative h-[300px]">
                        <AnalysisChart />
                        <div className="absolute right-2 top-2 flex gap-1">
                          <Button variant="outline" size="sm">
                            <Download className="mr-1 h-4 w-4" />
                            PNG
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-1 h-4 w-4" />
                            PPTX
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="table" className="mt-0">
                      <div className="relative h-[300px]">
                        <AnalysisTable />
                        <div className="absolute right-2 top-2 flex gap-1">
                          <Button variant="outline" size="sm">
                            <Download className="mr-1 h-4 w-4" />
                            CSV
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-1 h-4 w-4" />
                            PPTX
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Insights Panel */}
              <Card className="flex-1">
                <CardHeader className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Insights and Business Decision</CardTitle>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-1 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <AnalysisInsights />
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* File Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Upload Data File</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                onUpload={handleFileUpload}
                isUploading={isUploading}
                accept=".sav,.csv,.xlsx,.xls"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {previewData && (
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data">Data Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          <TabsContent value="data" className="mt-4">
            {renderDataTable(previewData.preview_rows)}
          </TabsContent>
          <TabsContent value="metadata" className="mt-4">
            {renderMetadataTable(previewData.metadata)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
