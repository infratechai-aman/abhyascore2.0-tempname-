import { db } from '../firebase';
import {
    writeBatch, collection, getDocs, doc, serverTimestamp,
} from 'firebase/firestore';

// ─── Subject Mapping ──────────────────────────────────────────────────────────
// Converts XML attribute values (e.g. "Physics") into admin-panel subject names.
// Admin panel uses: 'Physics', 'Chemistry', 'Maths', 'Biology', 'Zoology'
const XML_SUBJECT_TO_NAME = {
    physics: 'Physics',
    chemistry: 'Chemistry',
    mathematics: 'Maths',
    maths: 'Maths',
    biology: null, // resolved below using chapterId (Botany vs Zoology)
};

function resolveSubjectName(xmlSubjectAttr, chapterId) {
    const key = xmlSubjectAttr.toLowerCase();
    if (key === 'biology') {
        return chapterId >= 310 ? 'Biology' : 'Zoology';
    }
    return XML_SUBJECT_TO_NAME[key] ?? xmlSubjectAttr;
}

// ─── XML Parser ───────────────────────────────────────────────────────────────
// Parses one XML file and returns flat question objects matching the new schema.
function parseXMLToFlatQuestions(xmlText) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const chapterNode = xmlDoc.getElementsByTagName('chapter')[0];
        if (!chapterNode) return [];

        const chapterId = parseInt(chapterNode.getAttribute('id'));
        const subjectAttr = chapterNode.getAttribute('subject') ?? '';
        const subjectName = resolveSubjectName(subjectAttr, chapterId);

        const questions = [];

        for (const diff of ['easy', 'medium', 'hard']) {
            const diffNode = xmlDoc.getElementsByTagName(diff)[0];
            if (!diffNode) continue;

            const diffCapitalized = diff.charAt(0).toUpperCase() + diff.slice(1);

            Array.from(diffNode.getElementsByTagName('question')).forEach((qNode) => {
                const questionText = qNode.getElementsByTagName('text')[0]?.textContent?.trim() ?? '';
                const answerLetter = qNode.getElementsByTagName('answer')[0]?.textContent?.trim() ?? '';
                const explanation = qNode.getElementsByTagName('explanation')[0]?.textContent?.trim() ?? '';

                // Build options as plain string[] (new flat schema)
                const optionNodes = Array.from(qNode.getElementsByTagName('option'));
                const options = optionNodes.map((o) => o.textContent?.trim() ?? '');

                // Resolve correctAnswer as the full text (not just the letter)
                const correctOpt = optionNodes.find((o) => o.getAttribute('id') === answerLetter);
                const correctAnswer = correctOpt?.textContent?.trim() ?? '';

                // ── Validation ────────────────────────────────────────────────────────
                if (!questionText) return; // question required
                if (options.length < 2) return; // need at least 2 options
                if (!correctAnswer) return; // correct answer required
                if (!options.includes(correctAnswer)) return; // must exist in options

                questions.push({
                    subject: subjectName,      // 'Physics', 'Chemistry', etc.
                    chapterId,                       // number
                    difficulty: diffCapitalized,  // 'Easy' | 'Medium' | 'Hard'
                    question: questionText,
                    options,                         // string[]
                    correctAnswer,                   // full text, not a letter
                    ...(explanation ? { explanation } : {}),
                });
            });
        }

        return questions;
    } catch (e) {
        console.error('[Migration] XML parse error:', e.message);
        return [];
    }
}

// ─── Deduplication ────────────────────────────────────────────────────────────
// Reads ALL existing question_pools documents once and builds a signature Set.
// Flat docs are identified by having a string 'question' field.
// This avoids per-question Firestore reads (very expensive at scale).
async function buildExistingSignatureSet() {
    const snap = await getDocs(collection(db, 'question_pools'));
    const set = new Set();

    snap.docs.forEach((d) => {
        const data = d.data();
        // Only flat-schema docs have a string 'question' field
        if (typeof data.question === 'string') {
            set.add(`${data.subject}|${data.chapterId}|${data.difficulty}|${data.question}`);
        }
    });

    return set;
}

function makeSignature(q) {
    return `${q.subject}|${q.chapterId}|${q.difficulty}|${q.question}`;
}

// ─── runMigration ─────────────────────────────────────────────────────────────

/**
 * One-time migration: reads every bundled XML file, converts questions to the
 * new flat Firestore schema, skips existing duplicates, and batch-writes the rest.
 *
 * Safe to run multiple times — existing documents are never overwritten.
 */
export async function runMigration() {
    console.log('[Migration] ─── Starting XML → Firestore flat-schema migration ───');

    // ── Step 1: Fetch existing flat docs for deduplication ──────────────────────
    console.log('[Migration] Scanning existing Firestore documents...');
    const existingSet = await buildExistingSignatureSet();
    console.log(`[Migration] ${existingSet.size} existing flat questions found (will be skipped).`);

    // ── Step 2: Parse all XML files ──────────────────────────────────────────────
    // import.meta.glob is resolved by Vite at build time; the pattern must be a
    // literal string. This does NOT bundle the XMLs eagerly — each is lazy-loaded.
    const modules = import.meta.glob('../data/raw_questions/*.xml', { as: 'raw', eager: false });

    let totalFound = 0;
    let totalSkipped = 0;
    const toUpload = [];

    for (const path of Object.keys(modules)) {
        if (path.includes('template')) continue;
        try {
            const xmlText = await modules[path]();
            const parsed = parseXMLToFlatQuestions(xmlText);
            totalFound += parsed.length;

            for (const q of parsed) {
                if (existingSet.has(makeSignature(q))) {
                    totalSkipped++;
                } else {
                    toUpload.push(q);
                }
            }

            console.log(`[Migration] Parsed ${path.split('/').pop()} → ${parsed.length} questions`);
        } catch (e) {
            console.error(`[Migration] Failed to load ${path}:`, e.message);
        }
    }

    console.log(
        `[Migration] Total XML questions: ${totalFound} | ` +
        `To upload: ${toUpload.length} | ` +
        `Skipped (duplicates): ${totalSkipped}`
    );

    if (toUpload.length === 0) {
        console.log('[Migration] ✅ Nothing to upload — Firestore is already up to date.');
        return { totalFound, totalUploaded: 0, totalSkipped };
    }

    // ── Step 3: Batch write (max 400 per batch for safety) ───────────────────────
    const BATCH_SIZE = 400;
    let totalUploaded = 0;
    let batchIndex = 0;

    for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
        const chunk = toUpload.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        for (const q of chunk) {
            const docRef = doc(collection(db, 'question_pools'));
            batch.set(docRef, { ...q, createdAt: serverTimestamp() });
        }

        await batch.commit();
        batchIndex++;
        totalUploaded += chunk.length;
        console.log(`[Migration] Batch ${batchIndex} committed: ${chunk.length} questions`);
    }

    console.log(
        `[Migration] ✅ Done! ` +
        `Uploaded: ${totalUploaded} | ` +
        `Skipped: ${totalSkipped} | ` +
        `Total XML: ${totalFound}`
    );

    return { totalFound, totalUploaded, totalSkipped };
}
