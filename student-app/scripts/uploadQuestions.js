
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// PASTE YOUR FIREBASE CONFIG HERE IF IT'S NOT IN src/firebase.js
// OR ENSURE src/firebase.js EXPORTS THE CONFIG OBJECT
// For now, I'll try to read it from src/firebase.js or ask user to paste it.

// Mock Config for the script structure - UPDATE THIS BEFORE RUNNING
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAW_DIR = path.join(__dirname, '../src/data/raw_questions');

// ------------------------------------------------------------------
// XML PARSER
// ------------------------------------------------------------------
const parseXML = (xmlContent) => {
    // Extract Chapter Info
    const chapterMatch = xmlContent.match(/<chapter subject="(.*?)" id="(.*?)" name="(.*?)">/);
    if (!chapterMatch) throw new Error("Invalid XML: Missing <chapter> tag");

    const [_, subject, chapterId, chapterName] = chapterMatch;

    // Extract Pools
    const pools = {};
    ['easy', 'medium', 'hard'].forEach(diff => {
        const poolRegex = new RegExp(`<${diff}>([\\s\\S]*?)<\\/${diff}>`);
        const poolMatch = xmlContent.match(poolRegex);

        if (poolMatch) {
            const questions = [];
            const qBlocks = poolMatch[1].split('</question>');

            qBlocks.forEach(block => {
                if (!block.trim()) return;

                const getTag = (tag) => {
                    const match = block.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 's')); // 's' flag for dotAll not supported in some older nodes, but usually ok
                    return match ? match[1].trim() : '';
                };

                const text = getTag('text');
                if (!text) return;

                const answer = getTag('answer');
                const explanation = getTag('explanation');

                const options = [];
                const optMatches = block.matchAll(/<option id="(.*?)">(.*?)<\/option>/g);
                for (const match of optMatches) {
                    options.push({ id: match[1], text: match[2] });
                }

                questions.push({
                    id: `${subject}-${chapterId}-${diff}-${questions.length + 1}`,
                    text,
                    options,
                    correctAnswer: answer,
                    explanation
                });
            });
            pools[diff] = questions;
        }
    });

    return { subject, chapterId, chapterName, pools };
};

// ------------------------------------------------------------------
// MAIN UPLOAD FUNCTION
// ------------------------------------------------------------------
const processFiles = async () => {
    try {
        const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.xml') && f !== 'template.xml');

        if (files.length === 0) {
            console.log("No XML files found in src/data/raw_questions/");
            return;
        }

        for (const file of files) {
            console.log(`Processing ${file}...`);
            const content = fs.readFileSync(path.join(RAW_DIR, file), 'utf-8');
            const data = parseXML(content);

            console.log(`Parsed ${data.subject} - ${data.chapterName}:`);
            console.log(`  Easy: ${data.pools.easy?.length || 0}`);
            console.log(`  Medium: ${data.pools.medium?.length || 0}`);
            console.log(`  Hard: ${data.pools.hard?.length || 0}`);

            // Upload to Firestore
            for (const [diff, questions] of Object.entries(data.pools)) {
                if (!questions || questions.length === 0) continue;

                const docId = `${data.subject}_${data.chapterId}_${diff}`.toLowerCase();
                const docRef = doc(db, "question_pools", docId);

                await setDoc(docRef, {
                    subject: data.subject,
                    chapterId: parseInt(data.chapterId),
                    difficulty: diff,
                    version: 1,
                    questions: questions
                });
                console.log(`  ✅ Uploaded ${docId}`);
            }
        }
        console.log("All done!");
    } catch (error) {
        console.error("Error:", error);
    }
};

processFiles();
