// FILE: lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables.\n' +
      'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

// IMPORTANT:
// createBrowserClient stores auth session in COOKIES,
// so middleware (createServerClient) can read it.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);