import { getDB } from '../config/db.js';

export interface PomodoroSession {
  session_id: number;
  task_id: number;
  user_id: number;
  duration_minutes: number;
  created_at: string;
}

export class PomodoroModel {
  static async logSession(taskId: number, userId: number, durationMinutes: number): Promise<number> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');

    const [result]: any = await db.execute(
      'INSERT INTO pomodoro_sessions (task_id, user_id, duration_minutes) VALUES (?, ?, ?)',
      [taskId, userId, durationMinutes]
    );

    return result.insertId;
  }

  static async getWeeklyStats(userId: number): Promise<{ task_id: number; total_minutes: number }[]> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');

    const [rows]: any = await db.execute(`
      SELECT task_id, SUM(duration_minutes) as total_minutes
      FROM pomodoro_sessions
      WHERE user_id = ? AND created_at >= NOW() - INTERVAL 7 DAY
      GROUP BY task_id
    `, [userId]);

    return rows.map((r: any) => ({
      task_id: Number(r.task_id),
      total_minutes: Number(r.total_minutes)
    }));
  }
}
