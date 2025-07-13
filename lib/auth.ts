import { NextRequest } from 'next/server';

type UserRole = 'admin' | 'user';

interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export async function getAdminSession(request: NextRequest): Promise<{ user: UserSession }> {
  // Get the admin session from cookies
  const sessionCookie = request.cookies.get('admin-session');
  
  if (!sessionCookie || !sessionCookie.value) {
    throw new Error('Unauthorized - No session cookie found');
  }

  try {
    // Parse the session cookie value
    const user = JSON.parse(sessionCookie.value) as UserSession;
    
    if (!user || !user.id || !user.email || user.role !== 'admin') {
      throw new Error('Forbidden - Admin access required');
    }
    
    return { user };
  } catch (error) {
    console.error('Error parsing admin session:', error);
    throw new Error('Unauthorized - Invalid session');
  }
}
