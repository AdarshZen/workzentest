import { Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow } from 'pg';

// Extend the PoolClient type to include our custom properties
declare module 'pg' {
  interface PoolClient {
    lastQuery?: any[];
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  let lastQuery: any[] = [];

  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was:`, lastQuery);
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args: any[]): any => {
    lastQuery = args;
    return query.apply(client, args as any);
  };

  client.release = (): any => {
    // Clear the timeout
    clearTimeout(timeout);
    // Set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export interface TestSession {
  id: string;
  name: string;
  test_id: string;
  test_name: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  is_active: boolean;
  description?: string;
}

export const getTestSession = async (sessionId: string): Promise<TestSession | null> => {
  try {
    const result = await query(
      'SELECT * FROM test_sessions WHERE id = $1 LIMIT 1',
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as TestSession;
  } catch (error) {
    console.error('Error fetching test session:', error);
    throw error;
  }
};

export interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'coding' | 'text';
  options?: string[];
  correct_answer?: string;
  points: number;
  order_num: number;
  test_session_id: string;
  created_at: string;
  updated_at: string;
}

export const getTestQuestions = async (sessionId: string): Promise<Question[]> => {
  try {
    const result = await query(
      `SELECT id, question_text, question_type, options, points, order_num, test_session_id, created_at, updated_at
       FROM questions 
       WHERE test_session_id = $1 
       ORDER BY order_num ASC`,
      [sessionId]
    );
    
    return result.rows as Question[];
  } catch (error) {
    console.error('Error fetching test questions:', error);
    throw error;
  }
};

export interface Candidate {
  id: string;
  name: string;
  email: string;
  test_session_id: string;
  started_at?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  answers?: any;
  score?: number;
}

export interface TestResult {
  id: string;
  test_session_id: string;
  candidate_id: string;
  answers: any;
  score: number;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const getCandidate = async (sessionId: string, email: string): Promise<Candidate | null> => {
  try {
    const result = await query(
      'SELECT * FROM candidates WHERE test_session_id = $1 AND email = $2 LIMIT 1',
      [sessionId, email]
    );
    
    return result.rows[0] as Candidate || null;
  } catch (error) {
    console.error('Error fetching candidate:', error);
    throw error;
  }
};

export const createCandidate = async (candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at' | 'started_at' | 'submitted_at' | 'score'>): Promise<Candidate> => {
  try {
    const result = await query(
      `INSERT INTO candidates (name, email, test_session_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [candidate.name, candidate.email, candidate.test_session_id]
    );
    
    return result.rows[0] as Candidate;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
};

export const updateCandidateStart = async (candidateId: string): Promise<Candidate> => {
  try {
    const result = await query(
      `UPDATE candidates 
       SET started_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [candidateId]
    );
    
    return result.rows[0] as Candidate;
  } catch (error) {
    console.error('Error updating candidate start time:', error);
    throw error;
  }
};

export const submitTestResults = async (candidateId: string, answers: any, score: number): Promise<TestResult> => {
  try {
    const result = await query(
      `WITH updated_candidate AS (
         UPDATE candidates 
         SET submitted_at = NOW() 
         WHERE id = $1 
         RETURNING *
       )
       INSERT INTO test_results (test_session_id, candidate_id, answers, score)
       SELECT test_session_id, $1, $2, $3
       FROM updated_candidate
       RETURNING *`,
      [candidateId, JSON.stringify(answers), score]
    );
    
    return result.rows[0] as TestResult;
  } catch (error) {
    console.error('Error submitting test results:', error);
    throw error;
  }
};

export const getTestResults = async (sessionId: string): Promise<TestResult[]> => {
  try {
    const result = await query(
      `SELECT tr.*, c.name as candidate_name, c.email as candidate_email
       FROM test_results tr
       JOIN candidates c ON tr.candidate_id = c.id
       WHERE tr.test_session_id = $1
       ORDER BY tr.submitted_at DESC`,
      [sessionId]
    );
    
    return result.rows as TestResult[];
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};

export const createTestQuestion = async (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question> => {
  try {
    const result = await query(
      `INSERT INTO questions (question_text, question_type, options, points, order_num, test_session_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        question.question_text,
        question.question_type,
        question.options ? JSON.stringify(question.options) : null,
        question.points,
        question.order_num,
        question.test_session_id
      ]
    );
    
    return result.rows[0] as Question;
  } catch (error) {
    console.error('Error creating test question:', error);
    throw error;
  }
};

export default {
  query,
  getClient,
  getTestSession,
  getTestQuestions,
  getCandidate,
  createCandidate,
  updateCandidateStart,
  submitTestResults,
  getTestResults,
  createTestQuestion,
};
