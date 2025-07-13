"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Search, Download, Eye, AlertTriangle, Clock, User } from "lucide-react"
import Link from "next/link"

// Mock results data
const mockResults = [
  {
    id: "result-1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    testName: "Senior Python Developer Assessment",
    companyName: "TechCorp Solutions",
    score: 85,
    totalQuestions: 15,
    correctAnswers: 13,
    timeSpent: 78, // minutes
    status: "COMPLETED",
    submittedAt: "2024-03-15T14:30:00Z",
    proctoringViolations: 0,
    tabSwitches: 1,
    faceDetectionFailures: 0,
    voiceDetections: 0,
  },
  {
    id: "result-2",
    candidateName: "Jane Smith",
    candidateEmail: "jane.smith@startup.com",
    testName: "Frontend React Challenge",
    companyName: "StartupXYZ",
    score: 92,
    totalQuestions: 12,
    correctAnswers: 11,
    timeSpent: 55,
    status: "COMPLETED",
    submittedAt: "2024-03-14T16:45:00Z",
    proctoringViolations: 0,
    tabSwitches: 0,
    faceDetectionFailures: 2,
    voiceDetections: 1,
  },
  {
    id: "result-3",
    candidateName: "Mike Johnson",
    candidateEmail: "mike.j@datacorp.com",
    testName: "Data Science Fundamentals",
    companyName: "DataCorp Inc",
    score: 67,
    totalQuestions: 20,
    correctAnswers: 13,
    timeSpent: 42,
    status: "TERMINATED",
    submittedAt: "2024-03-13T11:20:00Z",
    proctoringViolations: 3,
    tabSwitches: 5,
    faceDetectionFailures: 8,
    voiceDetections: 2,
  },
]

export default function AdminResultsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")

  const filteredResults = mockResults.filter((result) => {
    const matchesSearch =
      result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || result.status.toLowerCase() === statusFilter
    const matchesCompany = companyFilter === "all" || result.companyName === companyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200"
      case "TERMINATED":
        return "bg-red-100 text-red-700 border-red-200"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    return "text-red-600"
  }

  const exportResults = () => {
    // TODO: Implement CSV export
    console.log("Exporting results...")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-semibold text-gray-900">WorkZen Admin</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/admin/company-tests" className="text-gray-700 hover:text-gray-900 font-medium">
                  Company Tests
                </Link>
                <Link href="/admin/results" className="text-purple-600 font-semibold">
                  Results
                </Link>
                <Link href="/admin/analytics" className="text-gray-700 hover:text-gray-900 font-medium">
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 font-medium">
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results</h1>
            <p className="text-lg text-gray-600">View and analyze candidate performance</p>
          </div>
          <Button onClick={exportResults} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8 border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search candidates, tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 rounded-xl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-300 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="border-gray-300 rounded-xl">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="TechCorp Solutions">TechCorp Solutions</SelectItem>
                  <SelectItem value="StartupXYZ">StartupXYZ</SelectItem>
                  <SelectItem value="DataCorp Inc">DataCorp Inc</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredResults.length} of {mockResults.length} results
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card
              key={result.id}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {result.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{result.candidateName}</h3>
                      <p className="text-gray-600">{result.candidateEmail}</p>
                      <p className="text-sm text-gray-500">{result.testName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(result.status)} variant="outline">
                      {result.status}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{new Date(result.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.correctAnswers}/{result.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.timeSpent}m</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.proctoringViolations}</div>
                    <div className="text-sm text-gray-600">Violations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.tabSwitches}</div>
                    <div className="text-sm text-gray-600">Tab Switches</div>
                  </div>
                </div>

                {/* Proctoring Details */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Proctoring Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Face Detection Failures: {result.faceDetectionFailures}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>Voice Detections: {result.voiceDetections}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>Tab Switches: {result.tabSwitches}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{result.companyName}</span> • Submitted{" "}
                    {new Date(result.submittedAt).toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/results/${result.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full bg-transparent"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                      <Download className="w-4 h-4 mr-1" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
