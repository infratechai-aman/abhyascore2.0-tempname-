import { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../services/firestoreService';

export function useDashboardStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchDashboardStats()
            .then((data) => { if (!cancelled) setStats(data); })
            .catch((err) => { if (!cancelled) setError(err.message ?? 'Failed to load stats'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [refreshKey]);

    return { stats, loading, error, refresh: () => setRefreshKey((k) => k + 1) };
}
