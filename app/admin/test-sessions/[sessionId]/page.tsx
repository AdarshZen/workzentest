import { notFound } from 'next/navigation';
import { getTestSession } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default async function TestSessionPage({ params }: PageProps) {
  // Properly await the params
  const { sessionId } = await Promise.resolve(params);
  
  if (!sessionId) {
    return notFound();
  }

  // Fetch the test session data
  let session;
  try {
    session = await getTestSession(sessionId);
    
    if (!session) {
      return notFound();
    }
  } catch (error) {
    console.error('Error fetching test session:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error loading test session. Please try again later.</div>
      </div>
    );
  }

  // Return 404 if session not found
  if (!session) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test Session: {session.name}</h1>
        <Link href="/admin/test-sessions">
          <Button variant="outline">
            Back to Sessions
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Test Name</p>
                <p>{session.test_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="capitalize">{session.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p>{new Date(session.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href={`/admin/test-sessions/${sessionId}/candidates`}>
            <Button>View Candidates</Button>
          </Link>
          <Link href={`/admin/test-sessions/${sessionId}/edit`}>
            <Button variant="outline">Edit Session</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
