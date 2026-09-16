import { getDB } from '../config/db.js';

export interface User {
  user_id: number;
  name: string;
  email: string;
  created_at?: string;
}

export class UserModel {
  static async sync(userData: { name: string; email: string }): Promise<number> {
    const db = await getDB();
    if (!db) throw new Error('DB Connection Failed');

    // Check if user exists
    const [rows]: any = await db.execute('SELECT user_id FROM users WHERE email = ?', [userData.email]);
    
    if (rows.length > 0) {
      return rows[0].user_id;
    }

    // Insert new user
    const [result]: any = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [userData.name, userData.email, 'clerk_auth_managed']
    );
    
    return result.insertId;
  }
}
