'use client';

import { useStore } from '@/store/useStore';
import { GET_WORKOUT_FOR_DAY, EXERCISES_BY_TYPE, WORKOUT_SPLIT } from '@/constants/program';
import { ChevronDown, ChevronUp, Play, CheckCircle2, Calendar, History, List, ChevronRight, Clock, X, Info, ChevronLeft, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDetailedHistory, getStats } from '@/app/actions';
import { DetailedLog, DailyLog } from '@/types';

function DayModal({ dayIndex, onClose }: { dayIndex: number, onClose: () => void }) {
  const workoutType = GET_WORKOUT_FOR_DAY(dayIndex);
  const exercises = EXERCISES_BY_TYPE[workoutType] || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--card)',
          borderRadius: 24,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Day {dayIndex} Program</p>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>{workoutType}</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)' }}><X /></button>
        </div>
        
        <div style={{ padding: 24, maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {exercises.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>Rest and recover.</p>
          ) : (
            exercises.map((ex, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: ex.isScapula ? 'var(--accent)' : 'var(--text-secondary)', marginTop: 8 }} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: ex.isScapula ? 'var(--accent)' : 'var(--text)' }}>
                    {ex.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {ex.sets} sets × {ex.reps}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)' }}>
           <button 
            onClick={onClose}
            style={{ width: '100%', padding: 14, background: 'var(--card-hover)', borderRadius: 12, fontWeight: 600, fontSize: 14 }}
           >
             Close Preview
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExpandableSection({ title, children, isScapula = false }: { title: string, children: React.ReactNode, isScapula?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: isScapula ? '1px solid var(--accent-border)' : '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      background: isScapula ? 'var(--accent-muted)' : 'transparent',
    }}>
      <button 
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          color: isScapula ? 'var(--accent)' : 'inherit',
        }}>
        <span>{title}</span>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px 16px', color: 'var(--text-secondary)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard() {
  const { currentDay, streak, completedDays, incrementDay, decrementDay, resetStore } = useStore();
  const [history, setHistory] = useState<DetailedLog[]>([]);
  const [stats, setStats] = useState<DailyLog[]>([]);
  const [viewDay, setViewDay] = useState<number | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  
  const todayWorkout = GET_WORKOUT_FOR_DAY(currentDay);
  const progressPercent = (currentDay / 100) * 100;
  const isCompleted = completedDays.includes(currentDay);

  const lastVolume = stats.length > 0 ? stats[stats.length - 1].total_volume || 0 : 0;

  const { setOnlineStatus } = useStore();

  useEffect(() => {
    getDetailedHistory(5).then(res => {
      setHistory(res.data);
      if (res.error === 'OFFLINE') setOnlineStatus(false);
      else setOnlineStatus(true);
    }).catch(() => {});
    
    getStats().then(res => {
      setStats(res.data);
      if (res.error === 'OFFLINE') setOnlineStatus(false);
      else setOnlineStatus(true);
    }).catch(() => {});
  }, [completedDays, setOnlineStatus]);

  const upcomingDays = [currentDay + 1, currentDay + 2, currentDay + 3].map(day => ({
    day: day > 100 ? day - 100 : day,
    workout: GET_WORKOUT_FOR_DAY(day > 100 ? day - 100 : day)
  }));

  const handleReset = () => {
    if (confirm("This will permanently wipe your 100-day journey progress. Start over?")) {
      resetStore();
      setIsResetConfirming(false);
    }
  };

  return (
    <main className="page-padding" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: 120 }}>
      
      <AnimatePresence>
        {viewDay !== null && (
          <DayModal dayIndex={viewDay} onClose={() => setViewDay(null)} />
        )}
      </AnimatePresence>

      {/* 1. TOP SECTION (Schedule Navigator) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={decrementDay}
            style={{ 
              padding: 12, 
              background: 'var(--card)', 
              borderRadius: 12, 
              border: '1px solid var(--border)',
              color: currentDay === 1 ? 'var(--text-tertiary)' : 'var(--text)',
              opacity: currentDay === 1 ? 0.5 : 1
            }}
            disabled={currentDay === 1}
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Day {currentDay} <span style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>/ 100</span></h1>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{Math.round(progressPercent)}% PROGRESS</p>
          </div>

          <button 
            onClick={incrementDay}
            style={{ 
              padding: 12, 
              background: 'var(--card)', 
              borderRadius: 12, 
              border: '1px solid var(--border)',
              color: currentDay === 100 ? 'var(--text-tertiary)' : 'var(--text)',
              opacity: currentDay === 100 ? 0.5 : 1
            }}
            disabled={currentDay === 100}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div style={{ width: '100%', height: '6px', background: 'var(--card)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
        </div>
      </section>

      {/* 2. PRIMARY ACTION CARD */}
      <section style={{
        background: 'var(--card)',
        padding: '24px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workout Focus</span>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginTop: 4 }}>{todayWorkout}</h3>
          </div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            background: isCompleted ? 'var(--success-muted)' : 'var(--card-hover)',
            color: isCompleted ? 'var(--success)' : 'var(--text-secondary)',
          }}>
            {isCompleted ? 'COMPLETED' : 'READY'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
           <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Last Volume</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>{Math.round(lastVolume).toLocaleString()} kg</p>
           </div>
           <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Streak</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>{streak} Days</p>
           </div>
        </div>

        <Link href={todayWorkout === 'Rest' ? '#' : "/workout"} style={{
          width: '100%',
          background: isCompleted ? 'var(--card-hover)' : 'var(--accent)',
          color: isCompleted ? 'var(--text-secondary)' : '#fff',
          padding: '18px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 700,
          gap: '10px',
          pointerEvents: todayWorkout === 'Rest' || isCompleted ? 'none' : 'auto',
          transition: 'all 0.2s ease'
        }}>
          {isCompleted ? <CheckCircle2 size={20} /> : <Play size={20} fill="currentColor" />}
          {isCompleted ? 'Session Complete' : (todayWorkout === 'Rest' ? 'Recovery Only' : 'Start Workout')}
        </Link>

        {todayWorkout === 'Rest' && !isCompleted && (
          <button 
            onClick={() => incrementDay()}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: 12, 
              background: 'var(--accent-muted)', 
              color: 'var(--accent)', 
              fontWeight: 600, 
              fontSize: 14 
            }}
          >
            Mark Rest Day Complete
          </button>
        )}
      </section>

      {/* 3. UPCOMING PLAN SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} className="text-accent" /> Next Up
        </h3>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
           {upcomingDays.map((u, i) => (
             <button 
               key={i} 
               onClick={() => setViewDay(u.day)}
               style={{ 
                minWidth: '140px', 
                background: 'var(--card)', 
                padding: '20px', 
                borderRadius: '20px', 
                border: '1px solid var(--border)',
                flexShrink: 0,
                textAlign: 'left'
             }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Day {u.day}</p>
                 <Info size={12} className="text-tertiary" />
               </div>
               <p style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{u.workout}</p>
             </button>
           ))}
        </div>
      </section>

      {/* 4. ACTIVITY LOG SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} className="text-success" /> Recent Activity
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No history found for current day range.
            </div>
          ) : (
            history.map((log, i) => (
              <ExpandableSection key={i} title={`Day ${log.day_number}: ${log.workout_type}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {log.exercises?.filter((e: any) => e.exercise_name).map((ex: any, ei: number) => (
                    <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{ex.exercise_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {ex.sets_data?.length} sets
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {new Date(log.completed_at).toLocaleDateString()}
                  </div>
                </div>
              </ExpandableSection>
            ))
          )}
        </div>
      </section>

      {/* 5. RESET BUTTON */}
      <section style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
         <button 
           onClick={handleReset}
           style={{ 
             width: '100%', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             gap: 8, 
             color: 'var(--danger)', 
             fontSize: 13, 
             fontWeight: 600,
             opacity: 0.6
           }}
         >
           <RotateCcw size={14} />
           Reset 100-Day Journey
         </button>
      </section>

    </main>
  );
}
