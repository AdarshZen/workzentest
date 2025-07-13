"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, Target, BarChart3 } from "lucide-react"
import Link from "next/link"

// Mock analytics data
const analyticsData = {
  overview: {
    totalTests: 15,
    totalCandidates: 247,
    averageScore: 76,
    completionRate: 89,
  },
  testPerformance: [
    {
      testName: "Senior Python Developer Assessment",
      candidates: 45,
      averageScore: 78,
      completionRate: 91,
      averageTime: 82,
      passRate: 73,
    },
    {
      testName: "Frontend React Challenge",
      candidates: 67,
      averageScore: 82,
      completionRate: 94,
      averageTime: 58,
      passRate: 81,
    },
    {
      testName: "Data Science Fundamentals",
      candidates: 89,
      averageScore: 71,
      completionRate: 85,
      averageTime: 41,
      passRate: 65,
    },
  ],
  proctoringStats: {
    totalViolations: 23,
    tabSwitches: 45,
    faceDetectionFailures: 67,
    voiceDetections: 12,
    terminatedTests: 8,
  },
  companyStats: [
    { company: "TechCorp Solutions", tests: 5, candidates: 89, averageScore: 79 },
    { company: "StartupXYZ", tests: 3, candidates: 67, averageScore: 84 },
    { company: "DataCorp Inc", tests: 4, candidates: 91, averageScore: 72 },
  ],
}

export default function AdminAnalyticsPage() {
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
                <Link href="/admin/results" className="text-gray-700 hover:text-gray-900 font-medium">
                  Results
                </Link>
                <Link href="/admin/analytics" className="text-purple-600 font-semibold">
                  Analytics
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">Comprehensive insights into test performance and candidate behavior</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalTests}</div>
                  <div className="text-sm text-gray-600">Active Tests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalCandidates}</div>
                  <div className="text-sm text-gray-600">Total Candidates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Test Performance */}
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>Test Performance</span>
              </CardTitle>
              <CardDescription>Performance metrics across different assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analyticsData.testPerformance.map((test, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{test.testName}</h4>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {test.candidates} candidates
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Average Score</span>
                        <span className="font-medium">{test.averageScore}%</span>
                      </div>
                      <Progress value={test.averageScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Pass Rate</span>
                        <span className="font-medium">{test.passRate}%</span>
                      </div>
                      <Progress value={test.passRate} className="h-2" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Completion: {test.completionRate}%</span>
                    <span>Avg Time: {test.averageTime}min</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Proctoring Statistics */}
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Proctoring Statistics</span>
              </CardTitle>
              <CardDescription>Security and monitoring insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-600">{analyticsData.proctoringStats.totalViolations}</div>
                  <div className="text-sm text-red-700">Total Violations</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.proctoringStats.terminatedTests}
                  </div>
                  <div className="text-sm text-orange-700">Terminated Tests</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Tab Switches</span>
                  </div>
                  <span className="font-semibold text-gray-900">{analyticsData.proctoringStats.tabSwitches}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Face Detection Failures</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {analyticsData.proctoringStats.faceDetectionFailures}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">Voice Detections</span>
                  </div>
                  <span className="font-semibold text-gray-900">{analyticsData.proctoringStats.voiceDetections}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Security Insights</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 3.2% of tests had proctoring violations</li>
                  <li>• Most violations occur in first 15 minutes</li>
                  <li>• Voice detection helps identify collaboration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Performance */}
        <Card className="border border-gray-200 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Company Performance</span>
            </CardTitle>
            <CardDescription>Performance breakdown by company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analyticsData.companyStats.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{company.company}</h4>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>{company.tests} tests</span>
                      <span>{company.candidates} candidates</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{company.averageScore}%</div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
