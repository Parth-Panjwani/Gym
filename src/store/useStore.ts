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
  isOnline: boolean; // Tracks DB connectivity
  
  // Actions
  setFocusMode: (val: boolean) => void;
  incrementDay: () => void;
  decrementDay: () => void;
  setDay: (day: number) => void;
  markDayComplete: (day: number) => void;
  resetStore: () => void;
  setOnlineStatus: (status: boolean) => void;
}

export const useStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      currentDay: 1,
      streak: 0,
      isFocusMode: false,
      completedDays: [],
      isOnline: true,

      setFocusMode: (val) => set({ isFocusMode: val }),
      
      incrementDay: () => set((state) => ({ 
        currentDay: Math.min(state.currentDay + 1, 100) 
      })),
      
      decrementDay: () => set((state) => ({ 
        currentDay: Math.max(state.currentDay - 1, 1) 
      })),
      
      setDay: (day) => set({ 
        currentDay: Math.min(Math.max(day, 1), 100) 
      }),

      markDayComplete: (day) => set((state) => {
        if (state.completedDays.includes(day)) return state;
        return {
          completedDays: [...state.completedDays, day],
          streak: state.streak + 1
        };
      }),

      resetStore: () => set({
        currentDay: 1,
        streak: 0,
        isFocusMode: false,
        completedDays: []
      }),

      setOnlineStatus: (status) => set({ isOnline: status }),
    }),
    {
      name: 'gym-tracker-storage',
    }
  )
);
