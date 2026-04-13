export type WorkoutType = 'Chest + Triceps' | 'Back + Biceps' | 'Legs' | 'Shoulders' | 'Arms' | 'Recovery' | 'Rest';

export interface ProgramDay {
  day: number;
  type: WorkoutType;
  scapulaFocus: boolean;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    isScapula?: boolean;
  }[];
}

export const WORKOUT_SPLIT: Record<number, WorkoutType> = {
  1: 'Recovery', // Monday
  2: 'Chest + Triceps', // Tuesday
  3: 'Back + Biceps', // Wednesday
  4: 'Legs', // Thursday
  5: 'Shoulders', // Friday
  6: 'Arms', // Saturday
  0: 'Rest' // Sunday
};

const SCAPULA_BLOCK = [
  { name: 'Serratus Wall Slides', sets: 3, reps: '15', isScapula: true },
  { name: 'Scapular Push-ups', sets: 3, reps: '12', isScapula: true },
  { name: 'Prone Y-T-W Raises', sets: 2, reps: '10 each', isScapula: true },
];

export const GET_WORKOUT_FOR_DAY = (dayNumber: number): WorkoutType => {
  const dayOfWeek = (dayNumber + 1) % 7; // Assuming Day 1 is Monday
  return WORKOUT_SPLIT[dayOfWeek as keyof typeof WORKOUT_SPLIT];
};

export const EXERCISES_BY_TYPE: Record<WorkoutType, any[]> = {
  'Chest + Triceps': [
    ...SCAPULA_BLOCK,
    { name: 'Incline Bench Press', sets: 4, reps: '8-10' },
    { name: 'Flat Dumbbell Press', sets: 3, reps: '10-12' },
    { name: 'Cable Flys (Low to High)', sets: 3, reps: '15' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '12' },
    { name: 'Tricep Pushdowns', sets: 3, reps: '15' },
  ],
  'Back + Biceps': [
    ...SCAPULA_BLOCK,
    { name: 'Deadlifts', sets: 3, reps: '5' },
    { name: 'Pullups (Focus on Scapular Retraction)', sets: 3, reps: 'Max' },
    { name: 'Seated Cable Rows', sets: 3, reps: '10-12' },
    { name: 'Face Pulls', sets: 3, reps: '15', isScapula: true },
    { name: 'Hammer Curls', sets: 3, reps: '12' },
    { name: 'Incline Curls', sets: 3, reps: '12' },
  ],
  'Legs': [
    { name: 'Back Squats', sets: 4, reps: '6-8' },
    { name: 'Romanian Deadlifts', sets: 3, reps: '10-12' },
    { name: 'Leg Press', sets: 3, reps: '12-15' },
    { name: 'Leg Curls', sets: 3, reps: '15' },
    { name: 'Calf Raises', sets: 4, reps: '15-20' },
  ],
  'Shoulders': [
    ...SCAPULA_BLOCK,
    { name: 'Overhead Press', sets: 4, reps: '8-10' },
    { name: 'Lateral Raises', sets: 4, reps: '15-20' },
    { name: 'Rear Delt Flys', sets: 3, reps: '15' },
    { name: 'Dumbbell Shrugs', sets: 3, reps: '12' },
  ],
  'Arms': [
    { name: 'Barbell Curls', sets: 3, reps: '10' },
    { name: 'Skull Crushers', sets: 3, reps: '12' },
    { name: 'Preacher Curls', sets: 3, reps: '12' },
    { name: 'Dips', sets: 3, reps: 'Max' },
    { name: 'Wrist Curls', sets: 3, reps: '15' },
  ],
  'Recovery': [
    ...SCAPULA_BLOCK,
    { name: 'Cat-Cow Stretch', sets: 2, reps: '10' },
    { name: 'Thoracic Rotations', sets: 2, reps: '10 each' },
    { name: 'Dead Hangs', sets: 3, reps: '30s' },
  ],
  'Rest': []
};
