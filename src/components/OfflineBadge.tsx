'use client';

import { useStore } from '@/store/useStore';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBadge() {
  const { isOnline } = useStore();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'var(--danger-muted)',
            border: '1px solid var(--danger)',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <WifiOff size={14} className="text-danger" />
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: 'var(--danger)', 
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            Offline Mode
          </span>
          <div style={{ width: 1, height: 12, background: 'var(--danger)', opacity: 0.3 }} />
          <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 500 }}>
            Syncing Paused
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
