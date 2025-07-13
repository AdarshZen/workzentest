import { config } from 'dotenv';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

async function checkAdminTable() {
  try {
    console.log('Checking admin_users table structure...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Found (hidden for security)' : 'Not found');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return;
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check table structure
    const tableStructure = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users';
    `;
    
    console.log('Admin users table structure:');
    console.table(tableStructure);
    
    // Check if there are any admin users
    const adminUsers = await sql`
      SELECT * FROM admin_users LIMIT 5;
    `;
    
    console.log('Sample admin users:');
    console.table(adminUsers);
    
    console.log('Admin table check completed.');
  } catch (error) {
    console.error('Error checking admin table:', error);
  } finally {
    process.exit();
  }
}

checkAdminTable();
