import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 👇 Expose Supabase globally (for console testing)
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('✅ Supabase attached to window');
}
