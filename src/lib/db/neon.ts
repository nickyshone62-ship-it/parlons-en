import { neon } from '@neondatabase/serverless';

/**
 * Server-side Neon PostgreSQL SQL Client
 * Uses DATABASE_URL environment variable configured on Railway / Server.
 * NEVER exposes credentials to client-side.
 */
export function getNeonSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DATABASE_URL environment variable is missing. Configure it in .env.local or Railway.');
    }
    return null;
  }

  return neon(databaseUrl);
}

/**
 * Execute a parameterised SQL query on Neon PostgreSQL
 */
export async function queryNeon<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const sql = getNeonSql();
  if (!sql) {
    return [];
  }
  try {
    const result = await sql(query, params);
    return (result as unknown) as T[];
  } catch (error) {
    console.error('Neon PostgreSQL Query Error:', error);
    throw error;
  }
}
