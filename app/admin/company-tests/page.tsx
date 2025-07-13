"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Plus, Users, Clock, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TestSession {
  id: string
  test_name: string
  company_name: string
  duration_minutes: number
  test_type: string
  candidate_count: number
  completed_count: number
  is_active: boolean
  created_at: string
}

export default function AdminCompanyTestsPage() {
  const router = useRouter()
  const [testSessions, setTestSessions] = useState<TestSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTestSessions()
  }, [])

  const fetchTestSessions = async () => {
    try {
      const response = await fetch("/api/admin/test-sessions")
      if (response.status === 401) {
        router.push("/admin/login")
        return
      }
      if (response.ok) {
        const data = await response.json()
        setTestSessions(data)
      } else {
        setError("Failed to fetch test sessions")
      }
    } catch (error) {
      console.error("Failed to fetch test sessions:", error)
      setError("Failed to fetch test sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTestTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      mcq: { label: 'MCQ', variant: 'default' },
      coding: { label: 'Coding', variant: 'secondary' },
      text: { label: 'Text', variant: 'outline' },
      BOTH: { label: 'Mixed', variant: 'secondary' }
    }
    
    const { label, variant } = typeMap[type] || { label: type, variant: 'outline' }
    return <Badge variant={variant}>{label}</Badge>
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
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
                <Link href="/admin/company-tests" className="text-purple-600 font-semibold">
                  Company Tests
                </Link>
                <Link href="/admin/results" className="text-gray-700 hover:text-gray-900 font-medium">
                  Results
                </Link>
                <Link href="/admin/analytics" className="text-gray-700 hover:text-gray-900 font-medium">
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Test Sessions</h1>
            <p className="text-muted-foreground">
              Create and manage your test sessions
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/test-sessions/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Test
            </Link>
          </Button>
        </div>

        {testSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No test sessions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating a new test session.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/test-sessions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {testSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg">{session.test_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTestTypeBadge(session.test_type)}
                      <Badge variant={session.is_active ? 'default' : 'outline'}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{session.company_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{session.duration_minutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Candidates</p>
                        <p className="font-medium">
                          {session.completed_count} of {session.candidate_count} completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(session.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/test-sessions/${session.id}/candidates`}>
                        <Users className="mr-2 h-4 w-4" />
                        View Candidates
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/admin/test-sessions/${session.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
