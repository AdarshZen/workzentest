"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Play, RotateCcw, FileText, CheckCircle, XCircle, Clock } from "lucide-react"

interface TestCase {
  input: string
  expected: string
  description?: string
}

interface CodeEditorProps {
  language: string
  templateCode: string
  testCases: TestCase[]
  onCodeChange: (code: string) => void
  questionText: string
}

export function CodeEditor({ language, templateCode, testCases, onCodeChange, questionText }: CodeEditorProps) {
  const [code, setCode] = useState(templateCode)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; output: string; expected: string }>>([])
  const [fontSize, setFontSize] = useState("14")
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    onCodeChange(newCode)
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("")
    setTestResults([])

    const startTime = Date.now()

    try {
      // Mock code execution
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      const endTime = Date.now()
      setExecutionTime(endTime - startTime)

      // Simulate test case execution
      const results = testCases.map((testCase) => {
        const passed = Math.random() > 0.3 // 70% pass rate for demo
        const output = passed ? testCase.expected : `Error: Expected ${testCase.expected}, got something else`

        return {
          passed,
          output,
          expected: testCase.expected,
        }
      })

      setTestResults(results)

      const passedCount = results.filter((r) => r.passed).length
      setOutput(
        `Executed successfully!\n${passedCount}/${results.length} test cases passed.\nExecution time: ${endTime - startTime}ms`,
      )
    } catch (error) {
      setOutput(`Error: ${error}`)
      setExecutionTime(null)
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    setCode(templateCode)
    setOutput("")
    setTestResults([])
    setExecutionTime(null)
    onCodeChange(templateCode)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      const newCode = code.substring(0, start) + "    " + code.substring(end)
      handleCodeChange(newCode)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      }, 0)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor Panel */}
      <div className="space-y-4">
        <Card className="border border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Code Editor</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </Badge>
              </CardTitle>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute left-0 top-0 w-12 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 font-mono leading-6 p-3 select-none">
                {code.split("\n").map((_, index) => (
                  <div key={index} className="text-right pr-2">
                    {index + 1}
                  </div>
                ))}
              </div>

              <Textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`min-h-[400px] pl-16 border-0 rounded-none font-mono resize-none focus-visible:ring-0 leading-6`}
                style={{ fontSize: `${fontSize}px` }}
                placeholder="Write your code here..."
                spellCheck={false}
              />
            </div>

            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetCode} className="border-gray-300 bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>

                {executionTime && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{executionTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Panel */}
      <div className="space-y-4">
        <Card className="border border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Problem Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{questionText}</pre>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Test Cases</span>
              {testResults.length > 0 && (
                <Badge
                  className={`${
                    testResults.every((r) => r.passed) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {testResults.filter((r) => r.passed).length}/{testResults.length} Passed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testCases.map((testCase, index) => {
              const result = testResults[index]
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result
                      ? result.passed
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Test Case {index + 1}</span>
                    {result && (
                      <div className="flex items-center space-x-1">
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${result.passed ? "text-green-700" : "text-red-700"}`}>
                          {result.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-gray-600">Input:</span>
                      <div className="bg-white p-2 rounded border mt-1">{testCase.input}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected:</span>
                      <div className="bg-white p-2 rounded border mt-1">{testCase.expected}</div>
                    </div>
                    {result && !result.passed && (
                      <div>
                        <span className="text-red-600">Your Output:</span>
                        <div className="bg-red-50 p-2 rounded border border-red-200 mt-1">{result.output}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle>Console Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[120px] max-h-[200px] overflow-y-auto">
              {output || "Run your code to see output..."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
