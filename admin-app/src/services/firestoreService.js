import { db } from '../firebase/firebase';
import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
    writeBatch, query, orderBy, limit, startAfter, where, serverTimestamp, Timestamp,
    getCountFromServer, getAggregateFromServer, sum,
} from 'firebase/firestore';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const fetchDashboardAnalytics = async () => {
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 86400_000));
    const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 86400_000));

    // ── Parallel fetches ──────────────────────────────────────────────────────
    const [
        totalUsersSnap,
        totalQuizSnap,
        xpAggSnap,
        activeUsers7dSnap,
        totalQuestionsSnap,
        activeQuestionsSnap,
        recentQuizSnap,
        allQuestionsSnap,
        allQuizSnap,
    ] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'quiz_results')),
        getAggregateFromServer(collection(db, 'users'), { totalXp: sum('stats.xp') }),
        getCountFromServer(query(collection(db, 'users'), where('stats.lastActive', '>=', sevenDaysAgo))),
        getCountFromServer(collection(db, 'question_pools')),
        getCountFromServer(query(collection(db, 'question_pools'), where('isActive', '==', true))),
        // last 30 days quiz docs (for activity trend + per-day breakdown)
        getDocs(query(
            collection(db, 'quiz_results'),
            where('timestamp', '>=', thirtyDaysAgo),
            orderBy('timestamp', 'desc'),
        )),
        // all questions (lightweight — only needs subject + difficulty + isActive)
        getDocs(collection(db, 'question_pools')),
        // all quiz results (for aggregation: subject popularity, avg score, etc.)
        getDocs(collection(db, 'quiz_results')),
    ]);

    // ── Process questions breakdown ───────────────────────────────────────────
    const questionsBySubject = {};  // { Physics: 12, Chemistry: 8, ... }
    const questionsByDifficulty = {};  // { Easy: 10, Medium: 8, Hard: 4 }
    const questionsByChapter = {};  // { '1': 5, '2': 3, ... }

    allQuestionsSnap.docs.forEach((d) => {
        const data = d.data();
        const subj = data.subject ?? 'Unknown';
        const diff = data.difficulty ?? 'Unknown';
        const ch = String(data.chapterId ?? '?');

        questionsBySubject[subj] = (questionsBySubject[subj] ?? 0) + 1;
        questionsByDifficulty[diff] = (questionsByDifficulty[diff] ?? 0) + 1;
        questionsByChapter[ch] = (questionsByChapter[ch] ?? 0) + 1;
    });

    // ── Process quiz results ──────────────────────────────────────────────────
    const subjectAttempts = {};  // { Physics: 20, ... }
    const subjectCorrect = {};  // { Physics: 160, ... }
    const subjectTotal = {};  // { Physics: 200, ... }
    const diffAttempts = {};  // { Easy: 10, ... }
    const chapterAttempts = {};  // { chapterId: count }
    const chapterCorrect = {};  // { chapterId: correct }
    const chapterTotal = {};  // { chapterId: total }
    let totalCorrect = 0;
    let totalAnswered = 0;
    let totalStars = 0;
    let passCount = 0;   // >= 60% = pass
    const dayActivity = {};  // { 'YYYY-MM-DD': count }

    allQuizSnap.docs.forEach((d) => {
        const r = d.data();
        const subj = r.subject ?? 'Unknown';
        const diff = r.difficulty ?? 'Unknown';
        const ch = String(r.chapterId ?? '?');
        const correct = Number(r.correct ?? 0);
        const total = Number(r.total ?? 0);
        const stars = Number(r.stars ?? 0);
        const pct = total > 0 ? correct / total : 0;

        subjectAttempts[subj] = (subjectAttempts[subj] ?? 0) + 1;
        subjectCorrect[subj] = (subjectCorrect[subj] ?? 0) + correct;
        subjectTotal[subj] = (subjectTotal[subj] ?? 0) + total;
        diffAttempts[diff] = (diffAttempts[diff] ?? 0) + 1;
        chapterAttempts[ch] = (chapterAttempts[ch] ?? 0) + 1;
        chapterCorrect[ch] = (chapterCorrect[ch] ?? 0) + correct;
        chapterTotal[ch] = (chapterTotal[ch] ?? 0) + total;
        totalCorrect += correct;
        totalAnswered += total;
        totalStars += stars;
        if (pct >= 0.6) passCount++;

        // Day activity bucket
        if (r.timestamp) {
            const ts = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
            const day = ts.toISOString().slice(0, 10);
            dayActivity[day] = (dayActivity[day] ?? 0) + 1;
        }
    });

    const totalAttempts = allQuizSnap.size;

    // Top 5 chapters by attempt count with avg score
    const topChapters = Object.entries(chapterAttempts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ch, attempts]) => ({
            chapterId: ch,
            attempts,
            avgScore: chapterTotal[ch] > 0
                ? Math.round((chapterCorrect[ch] / chapterTotal[ch]) * 100)
                : 0,
        }));

    // Hardest chapters (lowest avg score, min 5 attempts)
    const hardestChapters = Object.entries(chapterAttempts)
        .filter(([, cnt]) => cnt >= 5)
        .map(([ch, attempts]) => ({
            chapterId: ch,
            attempts,
            avgScore: chapterTotal[ch] > 0
                ? Math.round((chapterCorrect[ch] / chapterTotal[ch]) * 100)
                : 0,
        }))
        .sort((a, b) => a.avgScore - b.avgScore)
        .slice(0, 5);

    // Daily activity last 30 days (sorted)
    const dailyActivity = Object.entries(dayActivity)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

    // Recent 5 quiz results
    const recentResults = recentQuizSnap.docs.slice(0, 5).map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate
            ? d.data().timestamp.toDate().toISOString()
            : null,
    }));

    const avgScoreOverall = totalAnswered > 0
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : 0;
    const passRate = totalAttempts > 0
        ? Math.round((passCount / totalAttempts) * 100)
        : 0;
    const avgStarsPerQuiz = totalAttempts > 0
        ? (totalStars / totalAttempts).toFixed(1)
        : '0.0';

    return {
        // KPIs
        totalUsers: totalUsersSnap.data().count,
        totalQuizAttempts: totalAttempts,
        totalXP: xpAggSnap.data().totalXp ?? 0,
        activeUsers7d: activeUsers7dSnap.data().count,
        totalQuestions: totalQuestionsSnap.data().count,
        activeQuestions: activeQuestionsSnap.data().count,
        avgScoreOverall,
        passRate,
        avgStarsPerQuiz,
        // Breakdowns
        questionsBySubject,
        questionsByDifficulty,
        questionsByChapter,      // raw map
        subjectAttempts,
        subjectCorrect,
        subjectTotal,
        diffAttempts,
        // Lists
        topChapters,
        hardestChapters,
        dailyActivity,
        recentResults,
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
// pageSize=0 means fetch all (no limit)
export const fetchQuestionsPage = async (lastDoc = null, pageSize = 20, filters = {}) => {
    const whereClauses = [];
    if (filters.subject) whereClauses.push(where('subject', '==', filters.subject));
    if (filters.difficulty) whereClauses.push(where('difficulty', '==', filters.difficulty));

    const hasFilter = whereClauses.length > 0;
    const fetchAll = pageSize === 0;

    const constraints = [
        collection(db, 'question_pools'),
        ...whereClauses,
        ...(hasFilter ? [] : [orderBy('createdAt', 'desc')]),
        ...(fetchAll ? [] : [limit(pageSize + 1)]),
    ];
    if (lastDoc && !hasFilter && !fetchAll) constraints.splice(2, 0, startAfter(lastDoc));

    const snap = await getDocs(query(...constraints));
    const hasMore = fetchAll ? false : (snap.docs.length > pageSize);
    const docs = fetchAll ? snap.docs : snap.docs.slice(0, pageSize);
    return {
        questions: docs.map((d) => ({ id: d.id, ...d.data() })),
        lastDoc: docs[docs.length - 1] ?? null,
        hasMore: hasFilter ? false : hasMore,
    };
};

/** Cheap count query — no doc data fetched */
export const fetchQuestionsCount = async (filters = {}) => {
    const whereClauses = [];
    if (filters.subject) whereClauses.push(where('subject', '==', filters.subject));
    if (filters.difficulty) whereClauses.push(where('difficulty', '==', filters.difficulty));
    const q = query(collection(db, 'question_pools'), ...whereClauses);
    const snap = await getCountFromServer(q);
    return snap.data().count;
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
