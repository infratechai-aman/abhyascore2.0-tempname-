import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUsersPage } from '../services/firestoreService';

const PAGE_SIZE = 20;

export function useUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchUsersPage(null, PAGE_SIZE)
            .then(({ users, lastDoc: ld, hasMore: hm }) => {
                if (cancelled) return;
                setAllUsers(users);
                setLastDoc(ld);
                setHasMore(hm);
            })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading) return;
        setLoadingMore(true);
        try {
            const { users, lastDoc: ld, hasMore: hm } = await fetchUsersPage(lastDoc, PAGE_SIZE);
            setAllUsers((prev) => [...prev, ...users]);
            setLastDoc(ld);
            setHasMore(hm);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, loading, lastDoc]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return allUsers;
        const q = searchQuery.toLowerCase();
        return allUsers.filter((u) => u.email?.toLowerCase().includes(q));
    }, [allUsers, searchQuery]);

    return {
        users: filteredUsers,
        totalLoaded: allUsers.length,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        searchQuery,
        setSearchQuery,
    };
}
