import { createBrowserClient } from '@supabase/ssr';

// Fix Next.js browser polyfill process.version warning from @supabase/supabase-js
if (typeof window !== 'undefined') {
  try {
    if (!(window as any).process) {
      (window as any).process = { version: 'v22.0.0', env: {} };
    } else {
      Object.defineProperty((window as any).process, 'version', {
        value: 'v22.0.0',
        writable: true,
        configurable: true,
      });
    }
  } catch (e) {}
}

const FALLBACK_SUPABASE_URL = 'https://zgszhayubawamlteqory.supabase.co';
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnc3poYXl1YmF3YW1sdGVxb3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzA1OTAsImV4cCI6MjEwMzg0NjU5MH0.iaPJx859xRk88zGH7Kw5PSdga0ZRWRKDhjkYlIanRro';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

  return createBrowserClient(supabaseUrl, supabaseKey);
}
