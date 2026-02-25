// ─── Boss Battle Engine ───────────────────────────────────────────────────────
// Core logic for assembling boss exams, checking unlocks, and computing results.

import { db } from '../firebase';
import { collection, getDocs, setDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import {
    BOSSES, BOSS_DURATION,
    getSubjectsForStream, getPatternForStream,
} from './bossConfig';
import { shuffleArray } from './gameLogic';

// ────────────────────────────────────────────────────────────────────────────────
// XML QUESTION LOADING (mirrors gameLogic.js but returns tagged metadata)
// ────────────────────────────────────────────────────────────────────────────────

const parseXMLForBoss = (xmlText, chapterId, difficulty) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const chapterNode = xmlDoc.getElementsByTagName('chapter')[0];
        if (!chapterNode) return [];
        if (parseInt(chapterNode.getAttribute('id')) !== chapterId) return [];

        const subjectAttr = chapterNode.getAttribute('subject') || '';
        const chapterName = chapterNode.getAttribute('name') || '';

        const diffNode = xmlDoc.getElementsByTagName(difficulty.toLowerCase())[0];
        if (!diffNode) return [];

        const questions = [];
        Array.from(diffNode.getElementsByTagName('question')).forEach((qNode, idx) => {
            const text = qNode.getElementsByTagName('text')[0]?.textContent ?? '';
            const answer = qNode.getElementsByTagName('answer')[0]?.textContent ?? '';
            const explanation = qNode.getElementsByTagName('explanation')[0]?.textContent ?? '';
            const options = Array.from(qNode.getElementsByTagName('option')).map(opt => ({
                id: opt.getAttribute('id'),
                text: opt.textContent ?? '',
            }));

            if (text && options.length >= 2 && answer) {
                questions.push({
                    id: `boss_${chapterId}_${difficulty}_${idx + 1}`,
                    text,
                    options,
                    answer,
                    correctAnswer: answer,
                    explanation,
                    // Metadata for analytics
                    _subject: subjectAttr,
                    _chapter: chapterName,
                    _chapterId: chapterId,
                    _difficulty: difficulty,
                });
            }
        });
        return questions;
    } catch {
        return [];
    }
};

const loadXMLQuestionsForChapter = async (chapterId, difficulty) => {
    const modules = import.meta.glob('../data/raw_questions/*.xml', { as: 'raw', eager: false });
    for (const path of Object.keys(modules)) {
        if (path.includes('template')) continue;
        try {
            const xmlText = await modules[path]();
            const questions = parseXMLForBoss(xmlText, chapterId, difficulty);
            if (questions.length > 0) return questions;
        } catch { /* skip */ }
    }
    return [];
};

// ────────────────────────────────────────────────────────────────────────────────
// CHAPTER HELPERS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Get chapters belonging to a specific subject, sorted by id.
 */
const getChaptersBySubject = (allChapters, subjectCode) =>
    allChapters
        .filter(c => c.subject === subjectCode)
        .sort((a, b) => a.id - b.id);

/**
 * Check if a chapter is "completed" — has completedModes with all 3 (easy, medium, hard).
 */
const isChapterCompleted = (chapter) =>
    chapter.completedModes &&
    chapter.completedModes.includes('easy') &&
    chapter.completedModes.includes('medium') &&
    chapter.completedModes.includes('hard');

/**
 * Calculate syllabus completion percentage for a set of subjects.
 */
const getSyllabusPercent = (allChapters, subjectCodes) => {
    const relevantChapters = allChapters.filter(c => subjectCodes.includes(c.subject));
    if (relevantChapters.length === 0) return 0;
    const completed = relevantChapters.filter(isChapterCompleted).length;
    return Math.round((completed / relevantChapters.length) * 100);
};

// ────────────────────────────────────────────────────────────────────────────────
// UNLOCK CHECKER
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a boss is unlocked.
 * @param {object} boss - Boss config from BOSSES array
 * @param {Array} allChapters - Full chapters state array
 * @param {Array} subjectCodes - ['phy','chem','math'] or ['phy','chem','bio','zoo']
 * @param {Array} bossHistory - Array of past boss battle results
 * @param {number} totalXP - User's total XP
 * @returns {{ unlocked: boolean, reason: string }}
 */
export const checkBossUnlock = (boss, allChapters, subjectCodes, bossHistory = [], totalXP = 0) => {
    switch (boss.unlockType) {
        case 'chapters': {
            // Every subject must have first N chapters completed
            for (const sub of subjectCodes) {
                const subChapters = getChaptersBySubject(allChapters, sub);
                const needed = Math.min(boss.requiredChapterCount, subChapters.length);
                for (let i = 0; i < needed; i++) {
                    if (!isChapterCompleted(subChapters[i])) {
                        return {
                            unlocked: false,
                            reason: `Complete Chapter ${i + 1} of all subjects (need first ${boss.requiredChapterCount})`,
                        };
                    }
                }
            }
            return { unlocked: true, reason: '' };
        }

        case 'syllabus_percent': {
            const pct = getSyllabusPercent(allChapters, subjectCodes);
            if (pct < boss.requiredPercent) {
                return {
                    unlocked: false,
                    reason: `Complete ${boss.requiredPercent}% syllabus (currently ${pct}%)`,
                };
            }
            return { unlocked: true, reason: '' };
        }

        case 'boss_history': {
            // Must have attempted the required boss level
            const hasRequiredBoss = bossHistory.some(h => h.bossId >= boss.requiredBossLevel);
            if (!hasRequiredBoss) {
                return {
                    unlocked: false,
                    reason: `Complete Boss ${boss.requiredBossLevel} first`,
                };
            }
            // Must have enough total attempts
            if (bossHistory.length < boss.requiredAttempts) {
                return {
                    unlocked: false,
                    reason: `Need ${boss.requiredAttempts} total boss attempts (have ${bossHistory.length})`,
                };
            }
            // Check avg score of last 2 attempts
            const lastTwo = bossHistory.slice(-2);
            const avg = lastTwo.reduce((s, h) => s + (h.scorePercent || 0), 0) / lastTwo.length;
            if (avg < boss.requiredAvgScore) {
                return {
                    unlocked: false,
                    reason: `Need ${boss.requiredAvgScore}%+ avg in last 2 boss battles (current: ${Math.round(avg)}%)`,
                };
            }
            return { unlocked: true, reason: '' };
        }

        case 'final': {
            const pct = getSyllabusPercent(allChapters, subjectCodes);
            if (pct < boss.requiredPercent) {
                return { unlocked: false, reason: `Need ${boss.requiredPercent}% syllabus mastery (currently ${pct}%)` };
            }
            const boss9Attempts = bossHistory.filter(h => h.bossId >= 9).length;
            if (boss9Attempts < boss.requiredBoss9Attempts) {
                return { unlocked: false, reason: `Need ${boss.requiredBoss9Attempts}+ Boss 9 battles (have ${boss9Attempts})` };
            }
            if (totalXP < boss.requiredMinXP) {
                return { unlocked: false, reason: `Need ${boss.requiredMinXP} XP (have ${totalXP})` };
            }
            return { unlocked: true, reason: '' };
        }

        default:
            return { unlocked: false, reason: 'Unknown unlock type' };
    }
};

// ────────────────────────────────────────────────────────────────────────────────
// EXAM ASSEMBLER
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Determine which chapter IDs are "in scope" for a given boss tier.
 */
const getChaptersInScope = (boss, allChapters, subjectCodes) => {
    if (boss.unlockType === 'chapters') {
        // Only first N chapters per subject
        const result = {};
        for (const sub of subjectCodes) {
            const sorted = getChaptersBySubject(allChapters, sub);
            result[sub] = sorted.slice(0, boss.requiredChapterCount).map(c => c.id);
        }
        return result;
    }
    // For percentage-based and higher bosses, use all completed chapters
    const result = {};
    for (const sub of subjectCodes) {
        const sorted = getChaptersBySubject(allChapters, sub);
        const completed = sorted.filter(isChapterCompleted).map(c => c.id);
        // If none completed, fallback to all chapters (so we always have questions)
        result[sub] = completed.length > 0 ? completed : sorted.map(c => c.id);
    }
    return result;
};

/**
 * Pick N random questions from pool, excluding recent IDs.
 */
const pickQuestions = (pool, count, excludeIds = new Set()) => {
    const filtered = pool.filter(q => !excludeIds.has(q.id));
    const shuffled = shuffleArray(filtered);
    return shuffled.slice(0, count);
};

/**
 * Shuffle the options in each question and remap the correct answer.
 */
const shuffleQuestionOptions = (question) => {
    const shuffledOpts = shuffleArray([...question.options]);
    // Find where the correct answer moved to
    const originalCorrectText = question.options.find(o => o.id === question.answer)?.text;
    const newCorrectOpt = shuffledOpts.find(o => o.text === originalCorrectText);
    // Reassign IDs after shuffle
    const remappedOpts = shuffledOpts.map((opt, idx) => ({
        id: String.fromCharCode(65 + idx),
        text: opt.text,
    }));
    const newAnswer = newCorrectOpt
        ? String.fromCharCode(65 + shuffledOpts.indexOf(newCorrectOpt))
        : question.answer;

    return {
        ...question,
        options: remappedOpts,
        answer: newAnswer,
        correctAnswer: newAnswer,
    };
};

/**
 * Assemble a full boss exam.
 * @param {object} boss - Boss config object
 * @param {string} stream - 'JEE' or 'NEET'
 * @param {Array} allChapters - Full chapters state
 * @param {Array} recentQuestionIds - Q IDs from last 3 boss attempts to exclude
 * @param {Array} bossHistory - For Boss 8 adaptive logic (weak topics)
 * @returns {Promise<{ questions: Array, metadata: object }>}
 */
export const assembleBossExam = async (boss, stream, allChapters, recentQuestionIds = [], bossHistory = []) => {
    const subjectCodes = getSubjectsForStream(stream);
    const pattern = getPatternForStream(stream);
    const chaptersInScope = getChaptersInScope(boss, allChapters, subjectCodes);
    const excludeSet = new Set(recentQuestionIds);

    const allQuestions = [];

    for (const sub of subjectCodes) {
        const chapterIds = chaptersInScope[sub] || [];
        if (chapterIds.length === 0) continue;

        // Load all questions for all chapters in scope, grouped by difficulty
        const pools = { easy: [], medium: [], hard: [] };

        for (const chId of chapterIds) {
            for (const diff of ['easy', 'medium', 'hard']) {
                const qs = await loadXMLQuestionsForChapter(chId, diff);
                // Tag subject code onto each question
                qs.forEach(q => { q._subjectCode = sub; });
                pools[diff].push(...qs);
            }
        }

        // Calculate how many of each difficulty we need
        let easyNeeded = pattern.easy;
        let medNeeded = pattern.medium;
        let hardNeeded = pattern.hard;

        // Apply hard bias — upgrade some medium slots → hard
        if (boss.hardBias > 0) {
            const biasUpgrade = Math.round(medNeeded * boss.hardBias);
            hardNeeded += biasUpgrade;
            medNeeded -= biasUpgrade;
        }

        // Boss 8 adaptive: if we have weak chapter data, weight those chapters more
        // (We simply ensure weak chapters appear first in pool ordering)
        if (boss.id === 8 && bossHistory.length > 0) {
            const weakChapters = getWeakChapters(bossHistory, sub);
            for (const diff of ['easy', 'medium', 'hard']) {
                pools[diff] = [
                    ...pools[diff].filter(q => weakChapters.includes(q._chapterId)),
                    ...pools[diff].filter(q => !weakChapters.includes(q._chapterId)),
                ];
            }
        }

        // Pick questions, enforcing distribution
        const easyPicked = pickQuestions(pools.easy, easyNeeded, excludeSet);
        const medPicked = pickQuestions(pools.medium, medNeeded, excludeSet);
        const hardPicked = pickQuestions(pools.hard, hardNeeded, excludeSet);

        // If not enough questions in a difficulty, backfill from others
        let subQuestions = [...easyPicked, ...medPicked, ...hardPicked];
        const totalNeeded = pattern.questionsPerSubject;
        if (subQuestions.length < totalNeeded) {
            // Try to fill from any remaining pool
            const allRemaining = [...pools.easy, ...pools.medium, ...pools.hard]
                .filter(q => !excludeSet.has(q.id) && !subQuestions.find(sq => sq.id === q.id));
            const extra = shuffleArray(allRemaining).slice(0, totalNeeded - subQuestions.length);
            subQuestions = [...subQuestions, ...extra];
        }

        // Shuffle question order within the subject section
        subQuestions = shuffleArray(subQuestions);
        // Shuffle answer options per question
        subQuestions = subQuestions.map(shuffleQuestionOptions);

        allQuestions.push(...subQuestions);
    }

    return {
        questions: allQuestions,
        metadata: {
            bossId: boss.id,
            bossName: boss.name,
            stream,
            duration: BOSS_DURATION,
            totalQuestions: allQuestions.length,
            subjectsInScope: subjectCodes,
            pattern,
            generatedAt: new Date().toISOString(),
        },
    };
};

/**
 * Identify weak chapters from boss history for adaptive Boss 8.
 */
const getWeakChapters = (bossHistory, subjectCode) => {
    const chapterScores = {};
    for (const attempt of bossHistory) {
        if (!attempt.analytics) continue;
        for (const [chapId, data] of Object.entries(attempt.analytics.byChapter || {})) {
            if (data.subject !== subjectCode) continue;
            if (!chapterScores[chapId]) chapterScores[chapId] = { total: 0, correct: 0 };
            chapterScores[chapId].total += data.total || 0;
            chapterScores[chapId].correct += data.correct || 0;
        }
    }
    // Return chapters scoring < 50%
    return Object.entries(chapterScores)
        .filter(([, v]) => v.total > 0 && (v.correct / v.total) < 0.5)
        .map(([k]) => parseInt(k));
};

// ────────────────────────────────────────────────────────────────────────────────
// BOSS RESULTS & ANALYTICS
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Calculate boss battle results with per-chapter and per-difficulty analytics.
 */
export const calculateBossResults = (questions, userAnswers) => {
    let correct = 0;
    let total = questions.length;
    const bySubject = {};
    const byDifficulty = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    const byChapter = {};

    questions.forEach(q => {
        const userAns = userAnswers[q.id];
        const isCorrect = userAns === q.correctAnswer;
        if (isCorrect) correct++;

        // Subject analytics
        const sub = q._subjectCode || q._subject || 'unknown';
        if (!bySubject[sub]) bySubject[sub] = { correct: 0, total: 0 };
        bySubject[sub].total++;
        if (isCorrect) bySubject[sub].correct++;

        // Difficulty analytics
        const diff = q._difficulty || 'medium';
        if (byDifficulty[diff]) {
            byDifficulty[diff].total++;
            if (isCorrect) byDifficulty[diff].correct++;
        }

        // Chapter analytics
        const chapId = q._chapterId || 'unknown';
        if (!byChapter[chapId]) byChapter[chapId] = { correct: 0, total: 0, name: q._chapter || '', subject: sub };
        byChapter[chapId].total++;
        if (isCorrect) byChapter[chapId].correct++;
    });

    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const stars = scorePercent >= 90 ? 3 : scorePercent >= 60 ? 2 : scorePercent >= 30 ? 1 : 0;

    return {
        correct,
        total,
        scorePercent,
        stars,
        analytics: { bySubject, byDifficulty, byChapter },
    };
};

// ────────────────────────────────────────────────────────────────────────────────
// FIRESTORE PERSISTENCE
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Save a boss battle result to Firestore.
 */
export const saveBossResult = async (userId, bossId, resultData) => {
    if (userId === 'guest123') return;
    try {
        const docId = `boss${bossId}_${Date.now()}`;
        const ref = doc(db, 'users', userId, 'bossHistory', docId);
        await setDoc(ref, {
            bossId,
            ...resultData,
            timestamp: new Date(),
        });
        console.log(`Boss ${bossId} result saved:`, docId);
    } catch (error) {
        console.error('Error saving boss result:', error);
    }
};

/**
 * Fetch all boss battle history for a user.
 */
export const getBossHistory = async (userId) => {
    if (userId === 'guest123') return [];
    try {
        const ref = collection(db, 'users', userId, 'bossHistory');
        const q = query(ref, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching boss history:', error);
        return [];
    }
};

/**
 * Get question IDs from the last N boss attempts for de-duplication.
 */
export const getRecentBossQuestionIds = (bossHistory, lastN = 3) => {
    const recent = bossHistory.slice(0, lastN);
    const ids = [];
    for (const attempt of recent) {
        if (attempt.questionIds) {
            ids.push(...attempt.questionIds);
        }
    }
    return ids;
};
