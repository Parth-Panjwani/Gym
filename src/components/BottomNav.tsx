'use client';

import { Home, Dumbbell, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: BarChart2, label: 'Stats', path: '/stats' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 500,
      height: 72,
      background: 'rgba(11, 11, 15, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 20px',
              borderRadius: 12,
              transition: 'color 0.15s ease',
            }}
          >
            <item.icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.5}
              color={isActive ? 'var(--accent)' : 'var(--text-secondary)'}
            />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              letterSpacing: '0.02em',
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
