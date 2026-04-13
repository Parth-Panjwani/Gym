import { Pool } from 'pg';

// Create a singleton pool instance
let pool: Pool | null = null;

export const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.warn('DATABASE_URL is not defined. Database features will be disabled.');
      return null;
    }

    try {
      pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 5000,
        ssl: {
          rejectUnauthorized: false
        }
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        // Do not crash the process
      });
    } catch (err) {
      console.error('Failed to initialize database pool', err);
    }
  }
  return pool;
};

// Default export for compatibility
export default {
  connect: async () => {
    const p = getPool();
    if (!p) throw new Error('Database pool not initialized');
    return await p.connect();
  },
  query: async (text: string, params?: any[]) => {
    const p = getPool();
    if (!p) throw new Error('Database pool not initialized');
    return await p.query(text, params);
  }
};
