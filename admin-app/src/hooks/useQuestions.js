import { useState, useEffect, useCallback } from 'react';
import {
    fetchQuestionsPage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} from '../services/firestoreService';

const PAGE_SIZE = 20;

export function useQuestions() {
    const [questions, setQuestions] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchQuestionsPage(null, PAGE_SIZE)
            .then(({ questions: qs, lastDoc: ld, hasMore: hm }) => {
                if (cancelled) return;
                setQuestions(qs);
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
            const { questions: qs, lastDoc: ld, hasMore: hm } = await fetchQuestionsPage(lastDoc, PAGE_SIZE);
            setQuestions((prev) => [...prev, ...qs]);
            setLastDoc(ld);
            setHasMore(hm);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, loading, lastDoc]);

    // Optimistic add
    const addQuestion = useCallback(async (data) => {
        const tempId = `temp_${Date.now()}`;
        setQuestions((prev) => [{ id: tempId, ...data, createdAt: new Date() }, ...prev]);
        try {
            const id = await createQuestion(data);
            setQuestions((prev) => prev.map((q) => (q.id === tempId ? { ...q, id } : q)));
        } catch (e) {
            setQuestions((prev) => prev.filter((q) => q.id !== tempId));
            throw e;
        }
    }, []);

    // Optimistic edit
    const editQuestion = useCallback(async (id, data) => {
        let original;
        setQuestions((prev) => {
            original = prev.find((q) => q.id === id);
            return prev.map((q) => (q.id === id ? { ...q, ...data } : q));
        });
        try {
            await updateQuestion(id, data);
        } catch (e) {
            if (original) setQuestions((prev) => prev.map((q) => (q.id === id ? original : q)));
            throw e;
        }
    }, []);

    // Optimistic delete
    const removeQuestion = useCallback(async (id) => {
        let original;
        setQuestions((prev) => {
            original = prev.find((q) => q.id === id);
            return prev.filter((q) => q.id !== id);
        });
        try {
            await deleteQuestion(id);
        } catch (e) {
            if (original) setQuestions((prev) => [original, ...prev]);
            throw e;
        }
    }, []);

    return {
        questions,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        addQuestion,
        editQuestion,
        removeQuestion,
    };
}
