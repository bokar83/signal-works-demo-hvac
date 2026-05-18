import { useState, useCallback } from 'react';
import type { PracticeSession } from '../lib/types';
import { getSupabaseOrNull } from '../lib/supabase';

export function useSession() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (limit = 50) => {
    const supabase = getSupabaseOrNull();
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('baobab_practice_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (dbError) throw dbError;
      setSessions((data as PracticeSession[]) ?? []);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message ?? 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = useCallback(async (session: Omit<PracticeSession, 'id' | 'user_id' | 'created_at'>) => {
    const supabase = getSupabaseOrNull();
    if (!supabase) return null;
    try {
      const { data, error: dbError } = await supabase
        .from('baobab_practice_sessions')
        .insert(session)
        .select()
        .single();
      if (dbError) throw dbError;
      return data as PracticeSession;
    } catch (err: unknown) {
      const e = err as Error;
      console.error('[useSession] Save failed:', e.message);
      return null;
    }
  }, []);

  return { sessions, loading, error, fetchSessions, saveSession };
}
