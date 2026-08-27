import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL available:", !!import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Anon Key available:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

let supabaseInstance: any;

if (!rawUrl || !rawKey) {
  console.warn("Supabase credentials missing! VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is undefined in .env");
  
  const createMock = (path: string): any => {
    return new Proxy(() => {}, {
      get: (_target, prop) => {
        if (prop === 'then') return undefined; // Prevent infinite loops in Promise resolution
        return createMock(`${path}.${String(prop)}`);
      },
      apply: () => {
        throw new Error(`Supabase credentials missing! VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is undefined in .env`);
      }
    });
  };
  
  supabaseInstance = createMock("supabase");
} else {
  // Clean up any accidental spaces or surrounding quotes
  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '');
  const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

  supabaseInstance = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}

export const supabase = supabaseInstance;
