'use client';

import { useStore } from '@/store/useStore';
import { GET_WORKOUT_FOR_DAY, EXERCISES_BY_TYPE } from '@/constants/program';
import { ChevronLeft, Info, Check, Maximize, Minimize } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveWorkout } from '@/app/actions';
import { Exercise as ExerciseType, SetData } from '@/types';

export default function WorkoutPage() {
  const { currentDay, isFocusMode, setFocusMode, markDayComplete, incrementDay } = useStore();
  const router = useRouter();
  const todayWorkout = GET_WORKOUT_FOR_DAY(currentDay);
  const initialExercises = EXERCISES_BY_TYPE[todayWorkout] || [];
  
  const [exercises, setExercises] = useState<ExerciseType[]>(
    initialExercises.map((ex, idx) => ({
      ...ex,
      id: `${idx}`,
      setsData: Array(ex.sets || 3).fill(null).map(() => ({ weight: '', reps: '', failure: false, completed: false }))
    }))
  );

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const handleSetChange = (exIdx: number, setIdx: number, field: keyof SetData, value: any) => {
    const newExercises = [...exercises];
    newExercises[exIdx].setsData[setIdx] = {
      ...newExercises[exIdx].setsData[setIdx],
      [field]: value
    };
    setExercises(newExercises);
  };

  const onCompleteSession = async () => {
    try {
      await saveWorkout({
        dayNumber: currentDay,
        workoutType: todayWorkout,
        exercises: exercises
      });
    } catch (err) {
      console.error('Persistence failed:', err);
    }
    markDayComplete(currentDay);
    incrementDay();
    router.push('/');
  };

  if (todayWorkout === 'Rest') {
    return (
      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Rest Day</h2>
        <p style={{ color: 'var(--text-secondary)' }}>No workout scheduled for today.</p>
        <Link href="/" style={{ marginTop: 24, padding: 16, background: 'var(--card)', borderRadius: 12, textAlign: 'center', fontWeight: 600 }}>
          Back Home
        </Link>
      </main>
    );
  }

  return (
    <main style={{ paddingBottom: 100 }}>
      {/* HEADER */}
      <nav style={{ 
        padding: '16px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 10,
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={24} />
          </Link>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Execute</p>
            <h1 style={{ fontSize: 16, fontWeight: 700 }}>{todayWorkout}</h1>
          </div>
        </div>
        <button 
          onClick={() => setFocusMode(!isFocusMode)}
          style={{ 
            color: isFocusMode ? 'var(--accent)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            background: isFocusMode ? 'var(--accent-muted)' : 'var(--card)',
            padding: '6px 10px',
            borderRadius: 8
          }}
        >
          {isFocusMode ? <Minimize size={16} /> : <Maximize size={16} />}
          Focus
        </button>
      </nav>

      <div className="page-padding" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {exercises.map((ex, exIdx) => {
          if (isFocusMode && activeExerciseIndex !== exIdx) return null;

          return (
            <section 
              key={ex.id}
              style={{
                background: ex.isScapula ? 'var(--accent-muted)' : 'var(--card)',
                border: ex.isScapula ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}
            >
              <div className="page-padding" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20
                }}>
                  {/* EXERCISE HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {ex.isScapula && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                      Scapula Block
                    </span>
                  )}
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>{ex.name}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                    {ex.sets} sets × {ex.reps} • <span style={{ color: 'var(--text-tertiary)' }}>Prev: -- kg</span>
                  </p>
                </div>
                <button style={{ color: 'var(--text-secondary)' }}><Info size={20} /></button>
              </div>

              {/* SETS INPUT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Headers */}
                <div className="set-grid" style={{ padding: '0 4px', fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ textAlign: 'center' }}>Set</span>
                  <span style={{ textAlign: 'center' }}>kg</span>
                  <span style={{ textAlign: 'center' }}>Reps</span>
                  <span style={{ textAlign: 'center' }}>Fail</span>
                  <span style={{ textAlign: 'center' }}>Done</span>
                </div>

                {ex.setsData.map((set: SetData, setIdx: number) => (
                  <div key={setIdx} className="set-grid" style={{ 
                    opacity: set.completed ? 0.6 : 1,
                    transition: 'opacity 0.2s'
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {setIdx + 1}
                    </span>
                    
                    <input 
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '12px 0',
                        borderRadius: 8,
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    />
                    
                    <input 
                      type="number"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '12px 0',
                        borderRadius: 8,
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    />

                    <button 
                      onClick={() => handleSetChange(exIdx, setIdx, 'failure', !set.failure)}
                      style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        borderRadius: 8,
                        background: set.failure ? 'var(--danger-muted)' : 'var(--bg)',
                        border: set.failure ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border)',
                        color: set.failure ? 'var(--danger)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14
                      }}
                    >
                      !
                    </button>

                    <button 
                      onClick={() => handleSetChange(exIdx, setIdx, 'completed', !set.completed)}
                      style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        borderRadius: 8,
                        background: set.completed ? 'var(--success)' : 'var(--bg)',
                        border: set.completed ? '1px solid var(--success)' : '1px solid var(--border)',
                        color: set.completed ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>

              {/* FOCUS MODE NAVIGATION / COMPLETION */}
              {isFocusMode && (
                <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                   {activeExerciseIndex > 0 && (
                     <button
                       onClick={() => setActiveExerciseIndex(activeExerciseIndex - 1)}
                       style={{
                         padding: '16px',
                         background: 'var(--bg)',
                         border: '1px solid var(--border)',
                         borderRadius: 12,
                         fontWeight: 600,
                         flex: 1
                       }}
                     >
                       Previous
                     </button>
                   )}
                   <button
                     onClick={() => {
                        if (activeExerciseIndex === exercises.length - 1) onCompleteSession();
                        else setActiveExerciseIndex(activeExerciseIndex + 1);
                     }}
                     style={{
                       padding: '16px',
                       background: 'var(--accent)',
                       color: '#fff',
                       borderRadius: 12,
                       fontWeight: 600,
                       flex: 2
                     }}
                   >
                     {activeExerciseIndex === exercises.length - 1 ? 'Finish Workout' : 'Next Exercise'}
                   </button>
                </div>
              )}
                </div>
            </section>
          );
        })}

        {!isFocusMode && (
          <button 
            onClick={onCompleteSession}
            style={{
              width: '100%',
              padding: 20,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 16,
              marginTop: 16
            }}
          >
            Complete Session
          </button>
        )}
      </div>
    </main>
  );
}
