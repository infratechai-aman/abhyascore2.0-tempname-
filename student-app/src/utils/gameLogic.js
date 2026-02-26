import { db } from '../firebase';
import {
    doc, getDoc, collection, setDoc, getDocs, query, where,
} from 'firebase/firestore';
import { generateQuestionPool } from '../data/questions';

// ─── Subject Code → Admin Panel Name Mapping ──────────────────────────────────
// Admin panel stores full subject names; student app uses short codes.
// This bridges the two schemas without changing either app.
const SUBJECT_CODE_TO_NAME = {
    phy: 'Physics',
    chem: 'Chemistry',
    math: 'Maths',
    bio: 'Biology',
    zoo: 'Zoology',
};

// ─── Utility Exports ──────────────────────────────────────────────────────────

/** Fisher-Yates in-place safe shuffle */
export const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/** Convert a plain string[] of options to [{ id, text }] objects */
export const convertOptionsToObjectFormat = (options) =>
    options.map((text, i) => ({
        id: String.fromCharCode(65 + i), // 'A', 'B', 'C', 'D'
        text: String(text),
    }));

/**
 * Map a flat Firestore question document to the format QuizInterface expects.
 * Shuffles options and re-maps the correct answer letter to the new position.
 */
export const mapFirestoreQuestionToQuizFormat = (docData, docId) => {
    const { question, options = [], correctAnswer, explanation } = docData;

    // Shuffle option texts
    const shuffled = shuffleArray([...options]);

    // correctAnswer is the full text string; find its new index after shuffle
    const correctIdx = shuffled.indexOf(correctAnswer);
    const correctLetter = correctIdx >= 0
        ? String.fromCharCode(65 + correctIdx)
        : 'A'; // safe fallback

    return {
        id: docId,
        text: question,
        options: shuffled.map((text, i) => ({
            id: String.fromCharCode(65 + i),
            text: String(text),
        })),
        answer: correctLetter,      // used by calculateResults
        correctAnswer: correctLetter, // dual support for QuizInterface devMode
        explanation: explanation ?? '',
    };
};

// ─── Validation ───────────────────────────────────────────────────────────────

/** Remove any malformed questions before they reach the quiz engine */
const validateQuestions = (questions) =>
    questions.filter((q) => {
        if (!q.text && !q.question) return false;
        if (!q.options || q.options.length < 2) return false;
        if (!q.answer && !q.correctAnswer) return false;
        return true;
    });

// ─── XML Runtime Fallback ─────────────────────────────────────────────────────

const parseXMLChapter = (xmlText, chapterId, difficulty) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const chapterNode = xmlDoc.getElementsByTagName('chapter')[0];
        if (!chapterNode) return [];
        if (parseInt(chapterNode.getAttribute('id')) !== chapterId) return [];

        const diffNode = xmlDoc.getElementsByTagName(difficulty.toLowerCase())[0];
        if (!diffNode) return [];

        const questions = [];
        Array.from(diffNode.getElementsByTagName('question')).forEach((qNode, idx) => {
            const text = qNode.getElementsByTagName('text')[0]?.textContent ?? '';
            const answer = qNode.getElementsByTagName('answer')[0]?.textContent ?? '';
            const explanation = qNode.getElementsByTagName('explanation')[0]?.textContent ?? '';

            const options = Array.from(qNode.getElementsByTagName('option')).map((opt) => ({
                id: opt.getAttribute('id'),
                text: opt.textContent ?? '',
            }));

            if (text && options.length >= 2 && answer) {
                questions.push({
                    id: `xml_${chapterId}_${difficulty}_${idx + 1}`,
                    text,
                    options,
                    answer,
                    correctAnswer: answer,
                    explanation,
                });
            }
        });

        return questions;
    } catch {
        return [];
    }
};

/**
 * Scans all bundled XML files at runtime and returns questions for the matching
 * chapter + difficulty. Uses Vite's import.meta.glob for zero-config lazy loading.
 */
const loadXMLFallback = async (chapterId, difficulty) => {
    // Pattern must be a literal string — Vite resolves it at build time
    const modules = import.meta.glob('../data/raw_questions/*.xml', { as: 'raw', eager: false });

    for (const path of Object.keys(modules)) {
        if (path.includes('template')) continue;
        try {
            const xmlText = await modules[path]();
            const questions = parseXMLChapter(xmlText, chapterId, difficulty);
            if (questions.length > 0) return questions;
        } catch {
            // skip unreadable files
        }
    }
    return [];
};

// ─── Layer 1: Flat Firestore query (admin panel schema) ───────────────────────

const loadFlatFirestore = async (subject, chapterId, difficulty) => {
    // Translate to admin panel naming convention before querying
    const subjectName = SUBJECT_CODE_TO_NAME[subject] ?? subject;
    const diffCapitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    // NOTE: This compound equality query may require a composite Firestore index
    // on (subject, chapterId, difficulty). Firestore will log a link to create it
    // if needed — it can be created from the Firebase console in one click.
    const q = query(
        collection(db, 'question_pools'),
        where('subject', '==', subjectName),
        where('chapterId', '==', chapterId),
        where('difficulty', '==', diffCapitalized),
        where('isActive', '==', true),
    );

    const snap = await getDocs(q);
    if (snap.empty) return [];

    return snap.docs.map((d) => mapFirestoreQuestionToQuizFormat(d.data(), d.id));
};

// ─── Layer 2: Pooled Firestore doc (legacy AdminUpload schema) ─────────────────

const loadPooledFirestore = async (subject, chapterId, difficulty) => {
    const poolId = `${subject}_${chapterId}_${difficulty}`.toLowerCase();
    const docSnap = await getDoc(doc(db, 'question_pools', poolId));

    if (!docSnap.exists()) return [];

    const data = docSnap.data();
    if (!data.questions || data.questions.length === 0) return [];

    return data.questions;
};

// ─── startTestSession — 4-layer fallback ─────────────────────────────────────

export const startTestSession = async (subject, chapterId, difficulty) => {
    // ── Layer 1: Flat Firestore (admin panel questions) ──────────────────────
    try {
        const raw = await loadFlatFirestore(subject, chapterId, difficulty);
        const valid = validateQuestions(raw);
        if (valid.length > 0) {
            console.log(`[Quiz] ✅ Layer 1 (flat Firestore): ${valid.length} questions`);
            return shuffleArray(valid).slice(0, 25);
        }
    } catch (e) {
        console.warn('[Quiz] Layer 1 (flat Firestore) failed:', e.message);
    }

    // ── Layer 2: Pooled Firestore doc (legacy XML-upload schema) ─────────────
    try {
        const raw = await loadPooledFirestore(subject, chapterId, difficulty);
        const valid = validateQuestions(raw);
        if (valid.length > 0) {
            console.log(`[Quiz] ✅ Layer 2 (pooled Firestore): ${valid.length} questions`);
            return shuffleArray(valid).slice(0, 25);
        }
    } catch (e) {
        console.warn('[Quiz] Layer 2 (pooled Firestore) failed:', e.message);
    }

    // ── Layer 3: XML runtime fallback ─────────────────────────────────────────
    try {
        const raw = await loadXMLFallback(chapterId, difficulty);
        const valid = validateQuestions(raw);
        if (valid.length > 0) {
            console.log(`[Quiz] ✅ Layer 3 (XML): ${valid.length} questions`);
            return shuffleArray(valid).slice(0, 25);
        }
    } catch (e) {
        console.warn('[Quiz] Layer 3 (XML) failed:', e.message);
    }

    // ── Layer 4: Procedural mock generator (emergency — always works) ─────────
    console.warn('[Quiz] ⚠️ Layer 4 (mock): All real sources empty or failed');
    return shuffleArray(generateQuestionPool(subject, chapterId, difficulty)).slice(0, 25);
};

// ─── calculateResults ─────────────────────────────────────────────────────────

export const calculateResults = (questions, userAnswers) => {
    let score = 0, correct = 0, incorrect = 0, unattempted = 0;

    questions.forEach((q) => {
        const userAns = userAnswers[q.id];
        const correctAnswerVal = q.correctAnswer || q.answer;

        if (!userAns) {
            unattempted++;
        } else if (userAns === correctAnswerVal) {
            score += 4;
            correct++;
        } else {
            score -= 1;
            incorrect++;
        }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    let stars = 0;
    if (percentage === 100) stars = 3;
    else if (percentage >= 75) stars = 2;
    else if (percentage >= 40) stars = 1;

    return {
        score, correct, incorrect, unattempted,
        totalQuestions: questions.length,
        maxScore: questions.length * 4,
        percentage, stars,
    };
};

// ─── saveQuizResult ───────────────────────────────────────────────────────────

export const saveQuizResult = async (userId, resultData) => {
    // Guest accounts cannot save data to Firestore
    if (userId === 'guest123') return;

    try {
        const resultRef = doc(collection(db, 'quiz_results'));
        await setDoc(resultRef, { userId, ...resultData, timestamp: new Date() });
        console.log('Quiz result saved:', resultRef.id);
    } catch (error) {
        console.error('Error saving quiz result:', error);
    }
};

// ─── saveChapterProgress ──────────────────────────────────────────────────────

export const saveChapterProgress = async (userId, chapterId, progressData) => {
    // Guest accounts cannot save data to Firestore
    if (userId === 'guest123') return;

    try {
        const progRef = doc(db, 'users', userId, 'chapterProgress', String(chapterId));
        await setDoc(progRef, progressData, { merge: true });
        console.log(`Progress saved for Chapter ${chapterId}`);
    } catch (error) {
        console.error('Error saving chapter progress:', error);
    }
};

// ─── getUserProgress ──────────────────────────────────────────────────────────

export const getUserProgress = async (userId) => {
    // Guest accounts do not have Firestore records
    if (userId === 'guest123') return {};

    try {
        const progressRef = collection(db, 'users', userId, 'chapterProgress');
        const snapshot = await getDocs(progressRef);
        const progressMap = {};
        if (!snapshot.empty) {
            snapshot.forEach((d) => { progressMap[d.id] = d.data(); });
        }
        return progressMap;
    } catch (error) {
        console.error('Error fetching progress:', error);
        return {};
    }
};

// ─── getGlobalRank ───────────────────────────────────────────────────────────

/**
 * Calculate the global rank of a user based on XP.
 * Returns { rank, totalUsers, percentile }
 */
export const getGlobalRank = async (xp) => {
    try {
        const usersRef = collection(db, 'users');
        const allUsersSnap = await getDocs(usersRef);
        const totalUsers = allUsersSnap.size || 1;

        // Count users with higher XP
        // Note: For very large user bases, this should be replaced by a periodic aggregation
        const higherXPQuery = query(collection(db, 'users'), where('stats.xp', '>', xp));
        const higherXPSnap = await getDocs(higherXPQuery);
        const rank = higherXPSnap.size + 1;

        const percentile = Math.max(1, Math.min(100, Math.round(((totalUsers - rank + 1) / totalUsers) * 100)));

        return { rank, totalUsers, percentile };
    } catch (error) {
        console.error('Error calculating global rank:', error);
        return { rank: '?', totalUsers: '?', percentile: '?' };
    }
};
