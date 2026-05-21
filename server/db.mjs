import { Pool } from 'pg';
import { getDatabaseUrl, loadProjectEnv } from './env.mjs';

loadProjectEnv();

const connectionString = getDatabaseUrl();

if (!connectionString) {
  throw new Error('Database URL not found. Expected it in .env.local or src/.env.local');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

export const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
