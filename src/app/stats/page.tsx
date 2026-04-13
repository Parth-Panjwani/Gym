'use client';

import { useStore } from '@/store/useStore';
import { ChevronLeft, TrendingUp, Calendar, Zap, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStats } from '@/app/actions';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DailyLog } from '@/types';

export default function StatsPage() {
  const { streak, completedDays, currentDay } = useStore();
  const [dbStats, setDbStats] = useState<DailyLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats().then(setDbStats).catch(err => {
      console.error(err);
      setError("Database sync unavailable. Showing local data.");
    });
  }, []);

  const totalVolume = dbStats.reduce((acc, curr) => acc + Number(curr.total_volume || 0), 0);

  return (
    <main className="page-padding" style={{ padding: '24px 24px 100px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', padding: '8px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Driven by real lifting data</p>
        </div>
      </nav>

      {error && (
        <div style={{ background: 'var(--danger-muted)', border: '1px solid var(--danger)', padding: '12px 16px', borderRadius: '8px', color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
           {error}
        </div>
      )}

      {/* QUICK STATS */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Activity size={14} className="text-accent" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Volume</p>
          </div>
          <p style={{ fontSize: '20px', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{Math.round(totalVolume).toLocaleString()}</p>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total kg lifted</p>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Zap size={14} className="text-success" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Streak</p>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 700 }}>{streak} Days</p>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Current consistency</p>
        </div>
      </section>

      {/* CHART */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
         <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} className="text-accent" /> Volume Trend
         </h3>
         <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '20px', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={dbStats.length > 0 ? dbStats : Array.from({ length: 7 }).map((_, i) => ({ 
                 id: -1,
                 day_number: i, 
                 workout_type: 'Recovery' as any,
                 completed_at: new Date().toISOString(),
                 total_volume: 0 
               }))}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis 
                    dataKey="day_number" 
                    tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                    tickFormatter={(val) => `D${val}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--accent)', fontWeight: 700 }}
                    formatter={(value: any) => [`${Math.round(value).toLocaleString()} kg`, 'Volume']}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_volume" 
                    stroke="var(--accent)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                    animationDuration={1500}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
           Volume is calculated as sets × reps × weight (kg)
         </p>
      </section>

      {/* ROADMAP HEATMAP */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
           <Calendar size={18} className="text-secondary" /> Roadmap
        </h3>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '20px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
             {Array.from({ length: 100 }).map((_, i) => {
               const dayNum = i + 1;
               const isCompleted = completedDays.includes(dayNum);
               return (
                 <div 
                   key={i}
                   style={{
                     aspectRatio: '1 / 1',
                     borderRadius: '4px',
                     background: isCompleted ? 'var(--accent)' : 'var(--bg)',
                     border: isCompleted ? 'none' : '1px solid var(--border)',
                     transition: 'all 0.3s ease',
                     opacity: dayNum > currentDay + 7 ? 0.3 : 1
                   }}
                 />
               );
             })}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)' }}>DAY 1</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)' }}>DAY 100</p>
           </div>
        </div>
      </section>
    </main>
  );
}
