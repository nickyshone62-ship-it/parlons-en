import { createBrowserClient } from '@supabase/ssr';

// Safe proxy mock builder for legacy calls to deleted Supabase project
function createDummyQueryBuilder() {
  const dummy: any = {
    select: () => dummy,
    insert: () => dummy,
    update: () => dummy,
    upsert: () => dummy,
    delete: () => dummy,
    eq: () => dummy,
    neq: () => dummy,
    in: () => dummy,
    or: () => dummy,
    ilike: () => dummy,
    order: () => dummy,
    limit: () => dummy,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
  };
  return dummy;
}

export function createClient() {
  // If Supabase project is deleted or unconfigured, return safe fallback object that never fails
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      return createBrowserClient(supabaseUrl, supabaseKey);
    }
  } catch (e) {}

  return {
    from: () => createDummyQueryBuilder(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    channel: () => ({
      on: function() { return this; },
      subscribe: function() { return this; },
      send: async () => ({ error: null }),
      unsubscribe: () => {},
    }),
  } as any;
}
