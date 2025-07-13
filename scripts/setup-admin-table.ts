import { query } from '../lib/db';
import bcrypt from 'bcryptjs';

async function setupAdminTable() {
  try {
    // Check if admin_users table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_users'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating admin_users table...');
      
      // Create admin_users table
      await query(`
        CREATE TABLE admin_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Admin users table created successfully.');
    } else {
      console.log('Admin users table already exists.');
    }
    
    // Check if default admin user exists
    const adminCheck = await query(`
      SELECT COUNT(*) FROM admin_users WHERE email = 'admin@example.com';
    `);
    
    const adminExists = parseInt(adminCheck.rows[0].count) > 0;
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Insert default admin user
      await query(`
        INSERT INTO admin_users (email, name, password, role)
        VALUES ('admin@example.com', 'Admin User', $1, 'superadmin');
      `, [hashedPassword]);
      
      console.log('Default admin user created successfully.');
    } else {
      console.log('Default admin user already exists.');
    }
    
    console.log('Admin setup completed successfully.');
  } catch (error) {
    console.error('Error setting up admin table:', error);
  } finally {
    process.exit();
  }
}

setupAdminTable();
