import { useState, useEffect, useCallback } from 'react';
import {
    fetchQuestionsPage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkSetActive,
} from '../services/firestoreService';

const PAGE_SIZE = 20;

// filters: { subject: string, difficulty: string, chapterId: string }
// subject + difficulty → server-side Firestore where clauses
// chapterId            → client-side filter on loaded data
export function useQuestions(filters = {}) {
    const [allQuestions, setAllQuestions] = useState([]);  // raw from Firestore
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Firestore filters forwarded to the service (excludes chapterId — client-side)
    const serverFilters = {
        ...(filters.subject ? { subject: filters.subject } : {}),
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    };
    const serverFiltersKey = JSON.stringify(serverFilters);

    // Reset + refetch whenever server-side filters change
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setAllQuestions([]);
        setLastDoc(null);
        setHasMore(true);

        fetchQuestionsPage(null, PAGE_SIZE, serverFilters)
            .then(({ questions: qs, lastDoc: ld, hasMore: hm }) => {
                if (cancelled) return;
                setAllQuestions(qs);
                setLastDoc(ld);
                setHasMore(hm);
            })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverFiltersKey]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading) return;
        setLoadingMore(true);
        try {
            const { questions: qs, lastDoc: ld, hasMore: hm } =
                await fetchQuestionsPage(lastDoc, PAGE_SIZE, serverFilters);
            setAllQuestions((prev) => [...prev, ...qs]);
            setLastDoc(ld);
            setHasMore(hm);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingMore(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loadingMore, loading, lastDoc, serverFiltersKey]);

    // Client-side chapterId filter on top of the server results
    const questions = filters.chapterId
        ? allQuestions.filter((q) => String(q.chapterId) === String(filters.chapterId))
        : allQuestions;

    // Derive unique chapterIds from all loaded questions for the chapter dropdown
    const availableChapterIds = [...new Set(
        allQuestions
            .map((q) => q.chapterId)
            .filter((id) => id !== undefined && id !== null)
    )].sort((a, b) => a - b);

    // Optimistic add
    const addQuestion = useCallback(async (data) => {
        const tempId = `temp_${Date.now()}`;
        setAllQuestions((prev) => [{ id: tempId, ...data, createdAt: new Date() }, ...prev]);
        try {
            const id = await createQuestion(data);
            setAllQuestions((prev) => prev.map((q) => (q.id === tempId ? { ...q, id } : q)));
        } catch (e) {
            setAllQuestions((prev) => prev.filter((q) => q.id !== tempId));
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
        try {
            await deleteQuestion(id);
        } catch (e) {
            if (original) setAllQuestions((prev) => [original, ...prev]);
            throw e;
        }
    }, []);

    // Bulk activate / deactivate
    const bulkSetActiveQuestions = useCallback(async (ids, isActive) => {
        // Optimistic update
        setAllQuestions((prev) =>
            prev.map((q) => ids.includes(q.id) ? { ...q, isActive } : q)
        );
        try {
            await bulkSetActive(ids, isActive);
        } catch (e) {
            // Roll back on error
            setError(e.message);
            setAllQuestions((prev) =>
                prev.map((q) => ids.includes(q.id) ? { ...q, isActive: !isActive } : q)
            );
        }
    }, []);

    return {
        questions,            // filtered view
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
