// ─── Boss Battle Configuration ────────────────────────────────────────────────
// Defines all 10 Boss Battles with unlock conditions, exam patterns, and metadata.

// JEE subjects (3)
export const JEE_SUBJECTS = ['phy', 'chem', 'math'];
// NEET subjects (4)
export const NEET_SUBJECTS = ['phy', 'chem', 'bio', 'zoo'];

// Exam patterns per stream
export const EXAM_PATTERNS = {
    JEE: { questionsPerSubject: 25, easy: 5, medium: 10, hard: 10 },
    NEET: { questionsPerSubject: 45, easy: 20, medium: 15, hard: 10 },
};

// Duration: 3 hours in seconds
export const BOSS_DURATION = 3 * 60 * 60; // 10800

// ─── 10 Boss Definitions ──────────────────────────────────────────────────────

export const BOSSES = [
    {
        id: 1,
        name: 'Foundation Strike',
        subtitle: 'BOSS 1',
        description: 'Prove mastery of the first chapter across all subjects.',
        hardBias: 0,
        // Unlock: complete Chapter 1 of every subject in the user's stream
        unlockType: 'chapters',
        requiredChapterCount: 1, // first 1 chapter of each subject
    },
    {
        id: 2,
        name: 'Concept Builder',
        subtitle: 'BOSS 2',
        description: 'Chapters 1–3 cumulative mastery test.',
        hardBias: 0.05,
        unlockType: 'chapters',
        requiredChapterCount: 3,
    },
    {
        id: 3,
        name: 'Core Integration',
        subtitle: 'BOSS 3',
        description: 'Chapters 1–5 cumulative mastery test.',
        hardBias: 0.10,
        unlockType: 'chapters',
        requiredChapterCount: 5,
    },
    {
        id: 4,
        name: 'Mid-Sem Dominion',
        subtitle: 'BOSS 4',
        description: '50% syllabus completed — 11th Std done.',
        hardBias: 0.15,
        unlockType: 'syllabus_percent',
        requiredPercent: 50,
    },
    {
        id: 5,
        name: 'Advanced Suppression',
        subtitle: 'BOSS 5',
        description: '65% syllabus completed.',
        hardBias: 0.15,
        unlockType: 'syllabus_percent',
        requiredPercent: 65,
    },
    {
        id: 6,
        name: 'Precision Execution',
        subtitle: 'BOSS 6',
        description: '75% syllabus completed.',
        hardBias: 0.15,
        unlockType: 'syllabus_percent',
        requiredPercent: 75,
    },
    {
        id: 7,
        name: 'Pre-Final Gauntlet',
        subtitle: 'BOSS 7',
        description: '100% syllabus coverage — all chapters completed.',
        hardBias: 0.20,
        unlockType: 'syllabus_percent',
        requiredPercent: 100,
    },
    {
        id: 8,
        name: 'Weakness Annihilation',
        subtitle: 'BOSS 8',
        description: 'Adaptive exam — targets your weakest topics.',
        hardBias: 0.15,
        unlockType: 'boss_history',
        requiredBossLevel: 7,     // must have attempted boss 7
        requiredAttempts: 3,       // at least 3 boss battles total
        requiredAvgScore: 60,      // 60%+ avg in last 2 boss battles
    },
    {
        id: 9,
        name: 'Rank Predictor',
        subtitle: 'BOSS 9',
        description: 'Full-length mock with weighted difficulty scoring.',
        hardBias: 0.20,
        unlockType: 'boss_history',
        requiredBossLevel: 8,
        requiredAttempts: 4,
        requiredAvgScore: 80,      // 80%+ avg in last 2 boss battles
    },
    {
        id: 10,
        name: 'FINAL WAR: ALL INDIA SIMULATION',
        subtitle: '👑 BOSS 10',
        description: 'The ultimate test — full syllabus, maximum difficulty.',
        hardBias: 0.25,
        unlockType: 'final',
        requiredPercent: 90,       // 90% syllabus mastery
        requiredBoss9Attempts: 5,  // 5+ boss 9 level battles
        requiredMinXP: 5000,       // minimum total XP threshold
    },
];

/**
 * Get subjects for the given stream.
 */
export const getSubjectsForStream = (stream) =>
    stream === 'NEET' ? NEET_SUBJECTS : JEE_SUBJECTS;

/**
 * Get exam pattern for the given stream.
 */
export const getPatternForStream = (stream) =>
    EXAM_PATTERNS[stream] || EXAM_PATTERNS.JEE;
