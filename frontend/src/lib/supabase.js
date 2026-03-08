import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use sessionStorage so each browser tab has its own independent session.
    // This lets you log into different accounts in different tabs.
    storage: sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // No-op lock to prevent cross-tab deadlocks
    lock: async (name, acquireTimeout, fn) => {
      return await fn();
    },
  },
});
