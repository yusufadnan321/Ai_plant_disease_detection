import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured = Boolean(url && anonKey);

function createLocalQuery() {
  const result = { data: [], error: null };
  let query;
  query = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === 'then') {
          return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
        }
        return () => query;
      },
    }
  );
  return query;
}

const localSupabase = {
  from: () => createLocalQuery(),
};

export const supabase = configured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : localSupabase;
