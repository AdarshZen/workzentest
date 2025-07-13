"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trophy, Search, Building2, Users, Clock, Shield, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface TestSession {
  id: string
  testName: string
  companyName: string
  duration: number
  isActive: boolean
}

export default function CompanyTestPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tests, setTests] = useState<TestSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/company-tests')
        if (!response.ok) {
          throw new Error('Failed to fetch tests')
        }
        const data = await response.json()
        setTests(data)
      } catch (err) {
        console.error('Error fetching tests:', err)
        setError('Failed to load tests. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTests()
  }, [])

  const filteredTests = tests.filter(
    (test) =>
      test.isActive &&
      (test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-300 rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-300 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-purple-200 rounded-full"></div>
      </div>

      <div className="relative min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-semibold text-gray-900">WorkZen</span>
              </Link>
              <Badge className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full">Company Assessments</Badge>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Building2 className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">Company Assessments</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Take skill assessments hosted by companies. Find your test below or enter your unique assessment link.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-white rounded-full shadow-lg p-2">
                <div className="flex items-center flex-1 px-4">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <Input
                    placeholder="Search by company or test name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-gray-700 placeholder-gray-500"
                  />
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 font-medium">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Proctored</h3>
                <p className="text-sm text-gray-600">Advanced proctoring with camera and voice monitoring</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Timed Assessments</h3>
                <p className="text-sm text-gray-600">Complete assessments within company-defined time limits</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">Companies receive your results immediately after submission</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Tests */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Available Assessments</h2>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No active tests found.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTests.map((test) => (
                  <Link key={test.id} href={`/company-test/${test.id}/login`}>
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{test.testName}</CardTitle>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Building2 className="h-4 w-4 mr-1" />
                              {test.companyName}
                            </div>
                          </div>
                          <Badge variant="secondary" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {test.duration} min
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-1 text-green-500" />
                              Secure Test Environment
                            </div>
                          </div>
                          <Button size="sm">
                            Start Test
                            <Trophy className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Direct Link Section */}
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl">
            <CardHeader>
              <CardTitle className="text-center">Have a Direct Assessment Link?</CardTitle>
              <CardDescription className="text-center">
                If you received a direct link from a company, you can access your assessment directly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Assessment links typically look like:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">workzen.com/company-test/abc123</code>
              </p>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full bg-transparent"
              >
                Enter Assessment Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
