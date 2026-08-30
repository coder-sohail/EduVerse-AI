import { createClient } from '@supabase/supabase-js';
import type { EduVerseRole } from '@/lib/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getStoredRole(): Promise<EduVerseRole | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.role === 'teacher' || data?.role === 'student' ? data.role : null;
}

export async function saveCurrentProfile(role: EduVerseRole): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to save a profile.');

  const { error } = await supabase.from('profiles').upsert(
    {
      id: userData.user.id,
      full_name: userData.user.user_metadata?.full_name ?? userData.user.email?.split('@')[0] ?? null,
      role,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
}
