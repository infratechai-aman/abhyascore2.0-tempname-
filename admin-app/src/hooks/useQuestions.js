import { useState, useEffect, useCallback } from 'react';
import {
    fetchQuestionsPage,
    fetchQuestionsCount,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkSetActive,
} from '../services/firestoreService';

// filters: { subject: string, difficulty: string, chapterId: string }
// subject + difficulty → server-side Firestore where clauses
// chapterId            → client-side filter on loaded data
// pageSize             → 20 | 50 | 100 | 0 (0 = load all)
export function useQuestions(filters = {}, pageSize = 20) {
    const [allQuestions, setAllQuestions] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(null); // from getCountFromServer

    // Firestore-side filters (excludes chapterId — client-side only)
    const serverFilters = {
        ...(filters.subject ? { subject: filters.subject } : {}),
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    };
    const serverFiltersKey = JSON.stringify(serverFilters);
    const pageSizeKey = String(pageSize);

    // Reset + refetch whenever server-side filters or page size changes
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setAllQuestions([]);
        setLastDoc(null);
        setHasMore(true);
        setTotalCount(null);

        Promise.all([
            fetchQuestionsPage(null, pageSize, serverFilters),
            fetchQuestionsCount(serverFilters),
        ])
            .then(([{ questions: qs, lastDoc: ld, hasMore: hm }, count]) => {
                if (cancelled) return;
                setAllQuestions(qs);
                setLastDoc(ld);
                setHasMore(hm);
                setTotalCount(count);
            })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverFiltersKey, pageSizeKey]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading) return;
        setLoadingMore(true);
        try {
            const { questions: qs, lastDoc: ld, hasMore: hm } =
                await fetchQuestionsPage(lastDoc, pageSize, serverFilters);
            setAllQuestions((prev) => [...prev, ...qs]);
            setLastDoc(ld);
            setHasMore(hm);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingMore(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loadingMore, loading, lastDoc, serverFiltersKey, pageSizeKey]);

    // Client-side chapterId filter
    const questions = filters.chapterId
        ? allQuestions.filter((q) => String(q.chapterId) === String(filters.chapterId))
        : allQuestions;

    // Optimistic add
    const addQuestion = useCallback(async (data) => {
        const tempId = `temp_${Date.now()}`;
        setAllQuestions((prev) => [{ id: tempId, ...data, createdAt: new Date() }, ...prev]);
        setTotalCount((c) => (c !== null ? c + 1 : c));
        try {
            const id = await createQuestion(data);
            setAllQuestions((prev) => prev.map((q) => (q.id === tempId ? { ...q, id } : q)));
        } catch (e) {
            setAllQuestions((prev) => prev.filter((q) => q.id !== tempId));
            setTotalCount((c) => (c !== null ? c - 1 : c));
            throw e;
        }
    }, []);

    // Optimistic edit
    const editQuestion = useCallback(async (id, data) => {
        let original;
        setAllQuestions((prev) => {
            original = prev.find((q) => q.id === id);
            return prev.map((q) => (q.id === id ? { ...q, ...data } : q));
        });
        try {
            await updateQuestion(id, data);
        } catch (e) {
            if (original) setAllQuestions((prev) => prev.map((q) => (q.id === id ? original : q)));
            throw e;
        }
    }, []);

    // Optimistic delete
    const removeQuestion = useCallback(async (id) => {
        let original;
        setAllQuestions((prev) => {
            original = prev.find((q) => q.id === id);
            return prev.filter((q) => q.id !== id);
        });
        setTotalCount((c) => (c !== null ? c - 1 : c));
        try {
            await deleteQuestion(id);
        } catch (e) {
            if (original) setAllQuestions((prev) => [original, ...prev]);
            setTotalCount((c) => (c !== null ? c + 1 : c));
            throw e;
        }
    }, []);

    // Bulk activate / deactivate
    const bulkSetActiveQuestions = useCallback(async (ids, isActive) => {
        setAllQuestions((prev) =>
            prev.map((q) => ids.includes(q.id) ? { ...q, isActive } : q)
        );
        try {
            await bulkSetActive(ids, isActive);
        } catch (e) {
            setError(e.message);
            setAllQuestions((prev) =>
                prev.map((q) => ids.includes(q.id) ? { ...q, isActive: !isActive } : q)
            );
        }
    }, []);

    return {
        questions,        // client-filtered view (chapterId + status applied in Questions.jsx)
        allQuestions,     // server-loaded raw questions (before client filters)
        totalCount,       // Firestore count (cheap, no docs fetched)
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        addQuestion,
        editQuestion,
        removeQuestion,
        bulkSetActiveQuestions,
    };
}
