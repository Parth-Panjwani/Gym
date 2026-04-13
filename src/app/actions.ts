'use server';

import db from '@/lib/db';
import { WorkoutType, SetData, Exercise as ExerciseType, DailyLog, DetailedLog } from '@/types';

export async function saveWorkout(data: {
  dayNumber: number;
  workoutType: string;
  notes?: string;
  exercises: any[]; // Using any here because client-side state is slightly different, but the internal mapping is safe
}) {
  let client;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    
    // 1. Ensure tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id SERIAL PRIMARY KEY,
        day_number INTEGER UNIQUE,
        workout_type TEXT,
        notes TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id SERIAL PRIMARY KEY,
        daily_log_id INTEGER REFERENCES daily_logs(id),
        exercise_name TEXT,
        sets_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Insert daily log
    const dailyRes = await client.query(
      'INSERT INTO daily_logs (day_number, workout_type, notes) VALUES ($1, $2, $3) ON CONFLICT (day_number) DO UPDATE SET workout_type = $2, notes = $3 RETURNING id',
      [data.dayNumber, data.workoutType, data.notes || '']
    );
    const logId = dailyRes.rows[0].id;

    // 3. Clear old exercises for this day
    await client.query('DELETE FROM exercise_logs WHERE daily_log_id = $1', [logId]);

    // 4. Insert exercise logs
    for (const ex of data.exercises) {
      await client.query(
        'INSERT INTO exercise_logs (daily_log_id, exercise_name, sets_data) VALUES ($1, $2, $3)',
        [logId, ex.name, JSON.stringify(ex.setsData)]
      );
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Database Sync Error:', error);
    return { success: false, error: 'DB_SYNC_FAILED' };
  } finally {
    if (client) client.release();
  }
}

export async function getStats(): Promise<DailyLog[]> {
  let client;
  try {
    client = await db.connect();
    
    const res = await client.query(`
      SELECT 
        d.day_number, 
        d.workout_type, 
        d.completed_at,
        COALESCE((
          SELECT SUM(COALESCE((s->>'weight')::numeric, 0) * COALESCE((s->>'reps')::numeric, 0))
          FROM exercise_logs e, jsonb_array_elements(e.sets_data) as s
          WHERE e.daily_log_id = d.id
          AND s->>'completed' = 'true'
          AND s->>'weight' ~ '^[0-9.]+$'
          AND s->>'reps' ~ '^[0-9.]+$'
        ), 0) as total_volume
      FROM daily_logs d
      ORDER BY d.day_number ASC
    `);
    return res.rows;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return [];
  } finally {
    if (client) client.release();
  }
}

export async function getDetailedHistory(limit: number = 5): Promise<DetailedLog[]> {
  let client;
  try {
    client = await db.connect();
    
    // Fetch recent logs with their exercises
    const res = await client.query(`
      SELECT 
        d.id,
        d.day_number,
        d.workout_type,
        d.completed_at,
        json_agg(
          json_build_object(
            'exercise_name', e.exercise_name,
            'sets_data', e.sets_data
          )
        ) as exercises
      FROM daily_logs d
      LEFT JOIN exercise_logs e ON d.id = e.daily_log_id
      GROUP BY d.id
      ORDER BY d.day_number DESC
      LIMIT $1
    `, [limit]);

    return res.rows;
  } catch (error) {
    console.error('Failed to fetch detailed history:', error);
    return [];
  } finally {
    if (client) client.release();
  }
}
