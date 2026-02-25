import { useState, useEffect, useCallback } from "react";

export function useAutoRefresh(intervalMs = 30000) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [tick, setTick] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const id = setInterval(() => {
      setLastUpdated(new Date());
      setTick((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, autoRefreshEnabled]);

  const refresh = useCallback(() => {
    setLastUpdated(new Date());
    setTick((t) => t + 1);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((v) => !v);
  }, []);

  return { lastUpdated, tick, refresh, autoRefreshEnabled, toggleAutoRefresh };
}
