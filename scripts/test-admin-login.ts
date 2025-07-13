import { config } from 'dotenv';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

interface AdminUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  last_login: Date | null;
  created_at: Date;
}

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Found (hidden for security)' : 'Not found');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return;
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test with actual admin credentials from the database
    const email = 'admin@workzen.cc';
    const password = 'admin123';
    
    console.log(`Attempting to login with email: ${email}`);
    
    // Get admin user from database
    const result = await sql`
      SELECT id, email, name, password_hash, role, last_login, created_at
      FROM admin_users 
      WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      console.log('Admin user not found in database');
      return;
    }
    
    const admin = result[0] as AdminUser;
    console.log('Found admin user:', { id: admin.id, email: admin.email, name: admin.name, role: admin.role });
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (passwordMatch) {
      console.log('Admin login successful! Password matches.');
    } else {
      console.log('Admin login failed. Invalid password.');
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  } finally {
    process.exit();
  }
}

testAdminLogin();
