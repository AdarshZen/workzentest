"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Mail, Phone, User, Search, ArrowLeft, Loader2, Send, Filter, X, Trash2, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { ImportCandidates } from '@/components/admin/ImportCandidates'
import { exportToCsv } from '@/lib/export-utils'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: 'registered' | 'not_started' | 'started' | 'completed' | 'expired'
  last_activity: string
  score?: {
    correct: number
    total: number
    percentage: number
  }
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
}

export default function TestSessionCandidatesPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId || ''
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<{id: string, name: string} | null>(null)
  const [testSession, setTestSession] = useState<{
    id: string
    test_name: string
    company_name?: string
    status: string
    created_at: string
    updated_at: string
  } | null>(null)

  const fetchTestSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/test-sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setTestSession(data)
      }
    } catch (error) {
      console.error('Failed to fetch test session:', error)
    }
  }, [sessionId])

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/test-sessions/${sessionId}/candidates`)
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }
      const data = await response.json()
      console.log('Fetched candidates:', data) // Debug log
      setCandidates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setCandidates([])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchTestSession()
    fetchCandidates()
  }, [fetchTestSession, fetchCandidates])

  const handleRefresh = useCallback(() => {
    fetchCandidates()
  }, [fetchCandidates])

  useEffect(() => {
    fetchCandidates()
  }, [sessionId])

  const handleInvite = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/admin/test-sessions/${sessionId}/candidates/${candidateId}/invite`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Refresh the candidates list
        fetchCandidates()
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
    }
  }

  const handleInviteAll = async () => {
    try {
      const response = await fetch(`/api/admin/test-sessions/${sessionId}/invite-all`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Refresh the candidates list
        fetchCandidates()
      }
    } catch (error) {
      console.error('Failed to send invitations:', error)
    }
  }

  const handleDeleteClick = (candidate: Candidate) => {
    setCandidateToDelete({ id: candidate.id, name: candidate.name })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!candidateToDelete) return
    
    setDeletingId(candidateToDelete.id)
    try {
      const response = await fetch(
        `/api/admin/test-sessions/${sessionId}/candidates/${candidateToDelete.id}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        // Remove the deleted candidate from the list
        setCandidates(candidates.filter(c => c.id !== candidateToDelete.id))
      } else {
        const error = await response.json()
        console.error('Failed to delete candidate:', error)
        alert(error.error || 'Failed to delete candidate')
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
      alert('An error occurred while deleting the candidate')
    } finally {
      setDeletingId(null)
      setShowDeleteDialog(false)
      setCandidateToDelete(null)
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    // Text search filter
    const matchesSearch = searchQuery === '' || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter

    // Score filter
    let matchesScore = true
    if (scoreFilter !== 'all') {
      const score = candidate.score?.percentage || 0
      switch(scoreFilter) {
        case 'excellent': matchesScore = score >= 90; break
        case 'good': matchesScore = score >= 70 && score < 90; break
        case 'average': matchesScore = score >= 50 && score < 70; break
        case 'poor': matchesScore = score < 50; break
        case 'no-score': matchesScore = candidate.score === undefined; break
      }
    }

    return matchesSearch && matchesStatus && matchesScore
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      registered: { label: 'Registered', variant: 'outline' },
      not_started: { label: 'Not Started', variant: 'outline' },
      started: { label: 'In Progress', variant: 'secondary' },
      completed: { label: 'Completed', variant: 'default' },
      expired: { label: 'Expired', variant: 'destructive' },
    }
    
    const { label, variant } = statusMap[status] || { label: status, variant: 'outline' }
    return <Badge variant={variant}>{label}</Badge>
  }

  const handleExportCsv = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates to export')
      return
    }

    // Format data for export
    const exportData = filteredCandidates.map(candidate => ({
      'Name': candidate.name,
      'Email': candidate.email,
      'Phone': candidate.phone || '',
      'Status': candidate.status,
      'Last Activity': candidate.last_activity ? new Date(candidate.last_activity).toLocaleString() : 'Never',
      'Score': candidate.score ? `${candidate.score.percentage}% (${candidate.score.correct}/${candidate.score.total})` : 'N/A',
      'Start Time': candidate.start_time ? new Date(candidate.start_time).toLocaleString() : 'Not Started',
      'End Time': candidate.end_time ? new Date(candidate.end_time).toLocaleString() : 'Not Completed'
    }))

    // Generate filename with test session name and date
    const testName = testSession?.test_name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'test_session'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `candidates_${testName}_${dateStr}`

    // Export to CSV
    exportToCsv(exportData, filename)
  }



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/test-sessions/${sessionId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Test Details
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {testSession?.test_name} - Candidates
            </h1>
            <p className="text-muted-foreground">
              Manage candidates for {testSession?.company_name}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(statusFilter !== 'all' || scoreFilter !== 'all') && (
                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  {(statusFilter !== 'all' ? 1 : 0) + (scoreFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <ImportCandidates 
                testSessionId={sessionId} 
                onImportComplete={fetchCandidates} 
              />
              <Button 
                variant="outline" 
                onClick={handleExportCsv}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
            <Button onClick={handleInviteAll}>
              <Send className="mr-2 h-4 w-4" />
              Invite All
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-muted/50 p-4 rounded-lg mt-4 border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="registered">Registered</option>
                  <option value="not_started">Not Started</option>
                  <option value="started">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Score</label>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="all">All Scores</option>
                  <option value="excellent">Excellent (90-100%)</option>
                  <option value="good">Good (70-89%)</option>
                  <option value="average">Average (50-69%)</option>
                  <option value="poor">Needs Improvement (0-49%)</option>
                  <option value="no-score">No Score</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter('all')
                    setScoreFilter('all')
                  }}
                  className="h-10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-9 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} found
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {candidate.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {candidate.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            {candidate.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                      <TableCell>
                        {candidate.last_activity 
                          ? new Date(candidate.last_activity).toLocaleString() 
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        {candidate.score?.percentage !== undefined 
                          ? `${Math.round(candidate.score.percentage)}%` 
                          : candidate.status === 'completed' 
                            ? '0%' 
                            : '-'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(candidate)}
                          disabled={deletingId === candidate.id}
                        >
                          {deletingId === candidate.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                        {(candidate.status === 'registered' || candidate.status === 'not_started') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInvite(candidate.id)}
                            className="ml-2"
                          >
                            Send Invite
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchQuery ? 'No candidates match your search' : 'No candidates found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && candidateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Candidate</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {candidateToDelete.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setCandidateToDelete(null)
                }}
                disabled={!!deletingId}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={!!deletingId}
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
