"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, FileSpreadsheet, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploaderProps {
  onUpload: (files: FileList | null) => void
  isUploading: boolean
  onCancel: () => void
}

export function FileUploader({ onUpload, isUploading, onCancel }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files)
    }
  }

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files)
    }
  }

  // Handle upload button click
  const handleUpload = () => {
    if (selectedFiles) {
      onUpload(selectedFiles)

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(interval)
          }
          return newProgress
        })
      }, 200)
    }
  }

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "csv":
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-5 w-5 text-blue-500" />
      case "sav": // SPSS
        return <FileText className="h-5 w-5 text-purple-500" />
      case "py":
      case "r":
        return <FileCode className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {!isUploading ? (
        <>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mb-2 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium">Drag and drop your files here</p>
            <p className="mb-4 text-xs text-gray-500">
              Supports SPSS (.sav), CSV, Excel, R (.r), and Python (.py) files
            </p>
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              Browse Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.sav,.r,.py"
              onChange={handleChange}
            />
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Selected Files:</p>
              <ul className="space-y-2">
                {Array.from(selectedFiles).map((file, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      {getFileIcon(file.name)}
                      <span className="ml-2">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFiles(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFiles || selectedFiles.length === 0}>
              Upload
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4 p-4">
          <p className="text-center text-sm font-medium">Uploading files...</p>
          <Progress value={progress} className="h-2 w-full" />
          <p className="text-center text-xs text-gray-500">{progress}% complete</p>
        </div>
      )}
    </div>
  )
}
