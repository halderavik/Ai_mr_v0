"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  const [debugLog, setDebugLog] = useState<string>("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("marketpro_uploaded_data");
    if (stored) {
      try {
        setPreviewData(JSON.parse(stored));
        setDebugLog(prev => prev + "\n[DEBUG] Loaded previewData from localStorage.");
      } catch (e) {
        setDebugLog(prev => prev + "\n[DEBUG] Failed to parse previewData from localStorage.");
      }
    } else {
      setDebugLog(prev => prev + "\n[DEBUG] No previewData found in localStorage.");
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugLog(prev => prev + `\n[DEBUG] Chat handler triggered. input: '${input}', previewData: ${!!previewData}`);
    if (!input.trim()) {
      setDebugLog(prev => prev + "\n[DEBUG] Input is empty. Chat not sent.");
      setError("Please enter a message.");
      return;
    }
    if (!previewData) {
      setDebugLog(prev => prev + "\n[DEBUG] No previewData. Chat not sent.");
      setError("Please upload a file before requesting analysis.");
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setError(null);

    try {
      setDebugLog(prev => prev + "\n[DEBUG] Sending POST to /api/chat...");
      const resp = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_id: previewData.dataset_id,
          message: userMessage,
          filter_column: null,
          filter_value: null,
        }),
      });
      setDebugLog(prev => prev + `\n[DEBUG] Response status: ${resp.status}`);
      if (!resp.ok) throw new Error("Analysis failed");
      const data = await resp.json();
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
      setDebugLog(prev => prev + "\n[DEBUG] Chat response received and displayed.");
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Error: " + (err instanceof Error ? err.message : "Unknown error") }
      ]);
      setDebugLog(prev => prev + `\n[DEBUG] Error: ${err instanceof Error ? err.message : err}`);
    }
  };

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
      console.log("[DEBUG] Upload response:", data);
      if (!data.dataset_id) {
        setError("[DEBUG] Upload response missing dataset_id. See console for details.");
        setPreviewData(null);
        return;
      }
      setPreviewData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreviewData(null);
    } finally {
      setIsUploading(false);
    }
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
                {error && (
                  <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>
                )}
                {!previewData && (
                  <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded">[DEBUG] No file uploaded. Chat will not be sent to backend.</div>
                )}
                {debugLog && (
                  <pre className="mb-2 p-2 bg-gray-100 text-xs text-gray-700 rounded max-h-40 overflow-y-auto">{debugLog}</pre>
                )}
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
                onCancel={() => setShowUploader(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
