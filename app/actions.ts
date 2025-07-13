"use server";
import { neon } from "@neondatabase/serverless";
import bcrypt from 'bcryptjs';

// Use Neon serverless client directly
const sql = neon(process.env.DATABASE_URL!);

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  last_login: Date | null;
  created_at: Date;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  try {
    const result = await sql`
      SELECT id, email, name, password_hash, role, last_login, created_at 
      FROM admin_users 
      WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0] as AdminUser;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

export async function validateAdminCredentials(email: string, password: string): Promise<Omit<AdminUser, 'password_hash'> | null> {
  try {
    const admin = await getAdminByEmail(email);
    
    if (!admin) {
      return null;
    }
    
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!passwordMatch) {
      return null;
    }
    
    // Update last_login timestamp
    await sql`
      UPDATE admin_users 
      SET last_login = NOW() 
      WHERE id = ${admin.id}
    `;
    
    // Return admin without password_hash
    const { password_hash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return null;
  }
}

export async function createAdminUser(email: string, name: string, password: string, role: string = 'admin'): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await sql`
      INSERT INTO admin_users (email, name, password_hash, role, created_at) 
      VALUES (${email}, ${name}, ${hashedPassword}, ${role}, NOW())
    `;
    
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}
