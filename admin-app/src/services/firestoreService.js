import { db } from '../firebase/firebase';
import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
    query, orderBy, limit, startAfter, where, serverTimestamp, Timestamp,
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

export const fetchQuestionsPage = async (lastDoc = null, pageSize = 20) => {
    const constraints = [
        collection(db, 'question_pools'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1),
    ];
    if (lastDoc) constraints.splice(2, 0, startAfter(lastDoc));

    const snap = await getDocs(query(...constraints));
    const hasMore = snap.docs.length > pageSize;
    const docs = snap.docs.slice(0, pageSize);
    return {
        questions: docs.map((d) => ({ id: d.id, ...d.data() })),
        lastDoc: docs[docs.length - 1] ?? null,
        hasMore,
    };
};

export const createQuestion = async (data) => {
    const ref = await addDoc(collection(db, 'question_pools'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return ref.id;
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
