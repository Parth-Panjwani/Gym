export type WorkoutType = 'Chest + Triceps' | 'Back + Biceps' | 'Legs' | 'Shoulders' | 'Arms' | 'Recovery' | 'Rest';

export interface SetData {
  weight: string;
  reps: string;
  failure: boolean;
  completed: boolean;
}

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  isScapula?: boolean;
  setsData: SetData[];
}

export interface DailyLog {
  id: number;
  day_number: number;
  workout_type: WorkoutType;
  completed_at: string;
  total_volume?: number;
}

export interface DetailedLog extends DailyLog {
  exercises: {
    exercise_name: string;
    sets_data: SetData[];
  }[];
}
