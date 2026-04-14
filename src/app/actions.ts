'use server';

import clientPromise, { getDb } from '@/lib/db';
import { DailyLog, DetailedLog } from '@/types';

export async function saveWorkout(data: {
  dayNumber: number;
  workoutType: string;
  notes?: string;
  exercises: any[];
}) {
  try {
    const db = await getDb();
    
    // Using a single workouts collection
    const workoutDocument = {
      day_number: data.dayNumber,
      workout_type: data.workoutType,
      notes: data.notes || '',
      completed_at: new Date(),
      exercises: data.exercises.map(ex => ({
        exercise_name: ex.name,
        sets_data: ex.setsData
      }))
    };

    await db.collection('workouts').replaceOne(
      { day_number: data.dayNumber },
      workoutDocument,
      { upsert: true }
    );

    return { success: true };
  } catch (error: any) {
    console.warn('MongoDB connection unavailable (Sync suspended):', error.message);
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      return { success: false, error: 'OFFLINE' };
    }
    return { success: false, error: 'DB_SYNC_FAILED' };
  }
}

export async function getStats(): Promise<{ data: DailyLog[], error?: string }> {
  try {
    const db = await getDb();
    
    // Aggregation to calculate volume per day
    const stats: any[] = await db.collection('workouts').aggregate([
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets_data" },
      {
        $group: {
          _id: "$day_number",
          day_number: { $first: "$day_number" },
          workout_type: { $first: "$workout_type" },
          completed_at: { $first: "$completed_at" },
          total_volume: {
            $sum: {
              $cond: [
                { $eq: ["$exercises.sets_data.completed", true] },
                { 
                  $multiply: [
                    { $convert: { input: "$exercises.sets_data.weight", to: "double", onError: 0, onNull: 0 } },
                    { $convert: { input: "$exercises.sets_data.reps", to: "double", onError: 0, onNull: 0 } }
                  ]
                },
                0
              ]
            }
          }
        }
      },
      { $sort: { day_number: 1 } }
    ]).toArray();

    return { 
      data: stats.map(s => ({
        ...s,
        completed_at: s.completed_at instanceof Date ? s.completed_at.toISOString() : s.completed_at
      })) as DailyLog[] 
    };
  } catch (error: any) {
    console.warn('Failed to fetch stats (MongoDB Offline):', error.message);
    return { data: [], error: 'OFFLINE' };
  }
}

export async function getDetailedHistory(limit: number = 5): Promise<{ data: DetailedLog[], error?: string }> {
  try {
    const db = await getDb();
    
    // Fetch recent logs
    const res = await db.collection('workouts')
      .find({})
      .sort({ day_number: -1 })
      .limit(limit)
      .toArray();

    // Mapping MongoDB _id if needed, but the frontend uses day_number
    const history = res.map(doc => ({
      id: doc.day_number, // using day_number as a consistent ID
      day_number: doc.day_number,
      workout_type: doc.workout_type,
      completed_at: doc.completed_at.toISOString(),
      exercises: doc.exercises
    })) as DetailedLog[];

    return { data: history };
  } catch (error: any) {
    console.warn('Failed to fetch history (MongoDB Offline):', error.message);
    return { data: [], error: 'OFFLINE' };
  }
}
