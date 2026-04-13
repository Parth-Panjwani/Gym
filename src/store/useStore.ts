import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Set {
  weight: number;
  reps: number;
  isFailure: boolean;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  previousStats?: {
    weight: number;
    reps: number;
  };
}

interface WorkoutStore {
  currentDay: number;
  streak: number;
  isFocusMode: boolean;
  completedDays: number[];
  
  // Actions
  setFocusMode: (val: boolean) => void;
  incrementDay: () => void;
  markDayComplete: (day: number) => void;
}

export const useStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      currentDay: 1,
      streak: 0,
      isFocusMode: false,
      completedDays: [],

      setFocusMode: (val) => set({ isFocusMode: val }),
      incrementDay: () => set((state) => ({ currentDay: state.currentDay + 1 })),
      markDayComplete: (day) => set((state) => ({
        completedDays: [...state.completedDays, day],
        streak: state.streak + 1
      })),
    }),
    {
      name: 'gym-tracker-storage',
    }
  )
);
