import { createClient } from '@supabase/supabase-js';

// ⚙️ Your Supabase project credentials (set by Bolt or manually)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// 🧠 Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 👇 Optional: expose globally (so you can test it in console)
(window as any).supabase = supabase;
