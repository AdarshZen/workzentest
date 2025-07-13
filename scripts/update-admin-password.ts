import { config } from 'dotenv';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

async function updateAdminPassword() {
  try {
    console.log('Updating admin password...');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return;
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Admin email from the database
    const email = 'admin@workzen.cc';
    // New password to set
    const newPassword = 'admin123';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin password
    const result = await sql`
      UPDATE admin_users 
      SET password_hash = ${hashedPassword}
      WHERE email = ${email}
      RETURNING id, email, name, role
    `;
    
    if (result.length === 0) {
      console.log('Admin user not found.');
      return;
    }
    
    console.log('Admin password updated successfully!');
    console.log('Admin user details:', result[0]);
    console.log(`New password set to: ${newPassword}`);
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    process.exit();
  }
}

updateAdminPassword();
