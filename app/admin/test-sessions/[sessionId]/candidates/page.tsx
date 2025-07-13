"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Mail, Phone, User, Search, ArrowLeft, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { ImportCandidates } from '@/components/admin/ImportCandidates'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: 'invited' | 'started' | 'completed' | 'expired'
  last_activity: string
  score?: number
}

export default function TestSessionCandidatesPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [testSession, setTestSession] = useState<{
    id: string
    test_name: string
    company_name: string
    status: 'draft' | 'active' | 'completed'
  } | null>(null)

  useEffect(() => {
    fetchTestSession()
    fetchCandidates()
  }, [sessionId])

  const fetchTestSession = async () => {
    try {
      const response = await fetch(`/api/admin/test-sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setTestSession(data)
      }
    } catch (error) {
      console.error('Failed to fetch test session:', error)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`/api/admin/test-sessions/${sessionId}/candidates`)
      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      invited: { label: 'Invited', variant: 'outline' },
      started: { label: 'In Progress', variant: 'secondary' },
      completed: { label: 'Completed', variant: 'default' },
      expired: { label: 'Expired', variant: 'destructive' },
    }
    
    const { label, variant } = statusMap[status] || { label: status, variant: 'outline' }
    return <Badge variant={variant}>{label}</Badge>
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
            <ImportCandidates 
              testSessionId={sessionId} 
              onImportComplete={fetchCandidates} 
            />
            <Button onClick={handleInviteAll}>
              <Send className="mr-2 h-4 w-4" />
              Invite All
            </Button>
          </div>
        </div>
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
                        {new Date(candidate.last_activity).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {candidate.score !== undefined ? `${candidate.score}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {candidate.status === 'invited' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInvite(candidate.id)}
                          >
                            Resend Invite
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
    </div>
  )
}
