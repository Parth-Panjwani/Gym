'use client';

import { useStore } from '@/store/useStore';
import { GET_WORKOUT_FOR_DAY, EXERCISES_BY_TYPE, WORKOUT_SPLIT } from '@/constants/program';
import { ChevronDown, ChevronUp, Play, CheckCircle2, Calendar, History, List, ChevronRight, Clock, X, Info } from 'lucide-react';
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
  const { currentDay, streak, completedDays } = useStore();
  const [history, setHistory] = useState<DetailedLog[]>([]);
  const [stats, setStats] = useState<DailyLog[]>([]);
  const [viewDay, setViewDay] = useState<number | null>(null);
  
  const todayWorkout = GET_WORKOUT_FOR_DAY(currentDay);
  const progressPercent = (currentDay / 100) * 100;
  const isCompleted = completedDays.includes(currentDay);

  const lastVolume = stats.length > 0 ? stats[stats.length - 1].total_volume || 0 : 0;

  useEffect(() => {
    getDetailedHistory(5).then(setHistory);
    getStats().then(setStats);
  }, [completedDays]);

  const upcomingDays = [currentDay + 1, currentDay + 2, currentDay + 3].map(day => ({
    day,
    workout: GET_WORKOUT_FOR_DAY(day)
  }));

  return (
    <main className="page-padding" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      <AnimatePresence>
        {viewDay !== null && (
          <DayModal dayIndex={viewDay} onClose={() => setViewDay(null)} />
        )}
      </AnimatePresence>

      {/* 1. TOP SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Day {currentDay} <span style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>/ 100</span></h1>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{Math.round(progressPercent)}% DONE</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--card)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
        </div>
      </section>

      {/* 2. PRIMARY ACTION CARD */}
      <section style={{
        background: 'var(--card)',
        padding: '24px',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Current Goal</span>
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
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 700,
          gap: '10px',
          pointerEvents: todayWorkout === 'Rest' || isCompleted ? 'none' : 'auto'
        }}>
          {isCompleted ? <CheckCircle2 size={20} /> : <Play size={20} fill="currentColor" />}
          {isCompleted ? 'Session Complete' : (todayWorkout === 'Rest' ? 'Recovery Only' : 'Start Workout')}
        </Link>
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
                padding: '16px', 
                borderRadius: '16px', 
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
          {history.map((log, i) => (
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
          ))}
        </div>
      </section>

      {/* 5. WEEKLY ROUTINE REFERENCE */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <List size={18} className="text-secondary" /> Weekly Split
        </h3>
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
           {[1, 2, 3, 4, 5, 6, 0].map((dayCode, i) => {
             const workout = WORKOUT_SPLIT[dayCode as keyof typeof WORKOUT_SPLIT];
             const isToday = workout === todayWorkout;
             return (
               <button 
                 key={i} 
                 onClick={() => {
                   // Calculate some representative day index for this split item (e.g. within current week)
                   setViewDay(currentDay + ((dayCode || 7) - (currentDay % 7 || 7))); 
                 }}
                 style={{ 
                  width: '100%',
                  padding: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: i === 6 ? 'none' : '1px solid var(--border)',
                  background: isToday ? 'var(--accent-muted)' : 'transparent'
               }}>
                 <span style={{ fontSize: 13, fontWeight: 600 }}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayCode]}</span>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {workout}
                    </span>
                    <ChevronRight size={14} className="text-tertiary" />
                 </div>
               </button>
             );
           })}
        </div>
      </section>
    </main>
  );
}
