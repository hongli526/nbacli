import { useState, useEffect, useCallback } from "react";

export function useAutoRefresh(intervalMs = 30000) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setLastUpdated(new Date());
      setTick((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const refresh = useCallback(() => {
    setLastUpdated(new Date());
    setTick((t) => t + 1);
  }, []);

  return { lastUpdated, tick, refresh };
}
