import { db } from '../firebase/firebase';
import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
    writeBatch, query, orderBy, limit, startAfter, where, serverTimestamp, Timestamp,
    getCountFromServer, getAggregateFromServer, sum,
} from 'firebase/firestore';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const fetchDashboardStats = async () => {
    const sevenDaysAgo = Timestamp.fromDate(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const [totalUsersSnap, totalQuizSnap, xpAggSnap, activeUsersSnap] =
        await Promise.all([
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(collection(db, 'quiz_results')),
            getAggregateFromServer(collection(db, 'users'), {
                totalXp: sum('stats.xp'),
            }),
            getCountFromServer(
                query(
                    collection(db, 'users'),
                    where('stats.lastActive', '>=', sevenDaysAgo)
                )
            ),
        ]);

    return {
        totalUsers: totalUsersSnap.data().count,
        totalQuizAttempts: totalQuizSnap.data().count,
        totalXP: xpAggSnap.data().totalXp ?? 0,
        activeUsers7d: activeUsersSnap.data().count,
    };
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const fetchUsersPage = async (lastDoc = null, pageSize = 20) => {
    const constraints = [
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1),
    ];
    if (lastDoc) constraints.splice(2, 0, startAfter(lastDoc));

    const snap = await getDocs(query(...constraints));
    const hasMore = snap.docs.length > pageSize;
    const docs = snap.docs.slice(0, pageSize);
    return {
        users: docs.map((d) => ({ id: d.id, ...d.data() })),
        lastDoc: docs[docs.length - 1] ?? null,
        hasMore,
    };
};

// ─── Questions ───────────────────────────────────────────────────────────────

// filters: { subject?: string, difficulty?: string }
// chapterId filter is applied client-side (only flat-schema docs have it)
export const fetchQuestionsPage = async (lastDoc = null, pageSize = 20, filters = {}) => {
    const whereClauses = [];
    if (filters.subject) whereClauses.push(where('subject', '==', filters.subject));
    if (filters.difficulty) whereClauses.push(where('difficulty', '==', filters.difficulty));

    // When filtering, we can't reliably use orderBy('createdAt') + where() on
    // different fields without a composite index. Drop ordering when filtering
    // so we avoid missing-index errors; UI sorts client-side instead.
    const hasFilter = whereClauses.length > 0;

    const constraints = [
        collection(db, 'question_pools'),
        ...whereClauses,
        ...(hasFilter ? [] : [orderBy('createdAt', 'desc')]),
        limit(pageSize + 1),
    ];
    if (lastDoc && !hasFilter) constraints.splice(hasFilter ? 1 : 2, 0, startAfter(lastDoc));

    const snap = await getDocs(query(...constraints));
    const hasMore = snap.docs.length > pageSize;
    const docs = snap.docs.slice(0, pageSize);
    return {
        questions: docs.map((d) => ({ id: d.id, ...d.data() })),
        lastDoc: docs[docs.length - 1] ?? null,
        hasMore: hasFilter ? false : hasMore, // disable pagination when filtering
    };
};

export const createQuestion = async (data) => {
    const ref = await addDoc(collection(db, 'question_pools'), {
        ...data,
        isActive: data.isActive ?? true, // default active
        createdAt: serverTimestamp(),
    });
    return ref.id;
};

export const bulkSetActive = async (ids, isActive) => {
    // Firestore batch limit is 500; chunk just in case
    const CHUNK = 450;
    for (let i = 0; i < ids.length; i += CHUNK) {
        const batch = writeBatch(db);
        ids.slice(i, i + CHUNK).forEach((id) => {
            batch.update(doc(db, 'question_pools', id), { isActive });
        });
        await batch.commit();
    }
};

export const updateQuestion = async (id, data) => {
    await updateDoc(doc(db, 'question_pools', id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const deleteQuestion = async (id) => {
    await deleteDoc(doc(db, 'question_pools', id));
};
