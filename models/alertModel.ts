import { getDB } from '../config/db.js';

export class AlertModel {
  static async log(task1_id: number, task2_id: number, message: string) {
    const db = await getDB();
    if (!db) return;

    // Only log if this specific pair doesn't have an alert yet (to avoid duplicates)
    const [existing]: any = await db.execute(
      'SELECT alert_id FROM collision_alerts WHERE (task1_id = ? AND task2_id = ?) OR (task1_id = ? AND task2_id = ?)',
      [task1_id, task2_id, task2_id, task1_id]
    );

    if (existing.length === 0) {
      await db.execute(
        'INSERT INTO collision_alerts (task1_id, task2_id, message) VALUES (?, ?, ?)',
        [task1_id, task2_id, message]
      );
    }
  }
}
