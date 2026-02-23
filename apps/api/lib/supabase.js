import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_KEY not set — storage uploads will not work');
}

// Use the service role key for server-side operations (bypasses RLS)
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { persistSession: false },
});

export default supabase;
