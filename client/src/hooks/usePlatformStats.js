import { useEffect, useState } from "react";
import { getStats } from "../services/api";
import { useAuth } from "../state/AuthContext";

const emptyStats = {
  online: 0,
  waiting: 0,
  inCall: 0,
};

const normalizeStats = (stats) => ({
  online: Number(stats?.online || 0),
  waiting: Number(stats?.waiting || 0),
  inCall: Number(stats?.inCall || 0),
});

export const usePlatformStats = () => {
  const { isAuthenticated, socket } = useAuth();
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (isAuthenticated) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadStats = async () => {
      try {
        const response = await getStats();
        if (active) setStats(normalizeStats(response.data));
      } catch {
        if (active) setStats(emptyStats);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStats();

    const interval = window.setInterval(loadStats, 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !socket) return undefined;

    const onStatsUpdate = (nextStats) => {
      setStats(normalizeStats(nextStats));
      setLoading(false);
    };

    socket.on("stats_update", onStatsUpdate);
    return () => {
      socket.off("stats_update", onStatsUpdate);
    };
  }, [isAuthenticated, socket]);

  return { loading, stats };
};
