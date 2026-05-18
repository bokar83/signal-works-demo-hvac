import { useState, useEffect, useCallback } from 'react';
import { getEntitlementStatus, type EntitlementStatus } from '../lib/revenuecat';

export function useEntitlements() {
  const [status, setStatus] = useState<EntitlementStatus>('free');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getEntitlementStatus();
      setStatus(s);
    } catch {
      setStatus('free');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isPro = status === 'pro' || status === 'burst';
  const isFree = status === 'free';

  return { status, loading, isPro, isFree, refresh };
}
