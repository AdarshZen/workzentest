import { query } from '../lib/db';

async function createProctoringTable() {
  try {
    console.log('Creating proctoring_violations table if it does not exist...');
    
    // Check if table exists
    const checkTableResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'proctoring_violations'
      );
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (!tableExists) {
      // Create the table if it doesn't exist
      await query(`
        CREATE TABLE proctoring_violations (
          id SERIAL PRIMARY KEY,
          candidate_id INTEGER NOT NULL,
          test_session_id INTEGER NOT NULL,
          violation_type VARCHAR(255) NOT NULL,
          violation_time TIMESTAMP WITH TIME ZONE NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id),
          FOREIGN KEY (test_session_id) REFERENCES test_sessions(id)
        );
      `);
      console.log('✅ proctoring_violations table created successfully');
    } else {
      console.log('✅ proctoring_violations table already exists');
    }
  } catch (error) {
    console.error('❌ Error creating proctoring_violations table:', error);
    throw error;
  }
}

createProctoringTable()
  .then(() => console.log('Migration completed successfully'))
  .catch(error => console.error('Migration failed:', error))
  .finally(() => process.exit());
