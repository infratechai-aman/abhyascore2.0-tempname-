import { db } from '../firebase';
import { doc, getDoc, collection, setDoc, getDocs } from 'firebase/firestore';
import { generateQuestionPool } from '../data/questions';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Fetch questions from Firestore or generate fallback
export const startTestSession = async (subject, chapterId, difficulty) => {
    try {
        // Construct Pool ID (e.g., phy_1_easy)
        const poolId = `${subject}_${chapterId}_${difficulty}`.toLowerCase();
        const docRef = doc(db, "question_pools", poolId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.questions && data.questions.length > 0) {
                console.log(`Fetched ${data.questions.length} questions from Firestore pool: ${poolId}`);
                const shuffled = shuffleArray(data.questions);
                return shuffled.slice(0, 25); // Return 25 random questions
            }
        }

        console.warn(`Pool ${poolId} not found or empty. Using fallback procedural generation.`);
        // Fallback to old generator if DB is empty for this chapter
        const fallbackPool = generateQuestionPool(subject, chapterId, difficulty);
        const shuffled = shuffleArray(fallbackPool);
        return shuffled.slice(0, 25);

    } catch (error) {
        console.error("Error fetching test session:", error);
        // Emergency Fallback
        return shuffleArray(generateQuestionPool(subject, chapterId, difficulty)).slice(0, 25);
    }
};

// Calculate results based on user answers
export const calculateResults = (questions, userAnswers) => {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    let currentStreak = 0;
    let maxStreak = 0;

    questions.forEach(q => {
        const userAns = userAnswers[q.id];
        const correctAnswerVal = q.correctAnswer || q.answer; // Handle both properties

        if (!userAns) {
            unattempted++;
            currentStreak = 0; // Reset streak
        } else if (userAns === correctAnswerVal) {
            score += 4;
            correct++;
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
            score -= 1;
            incorrect++;
            currentStreak = 0; // Reset streak
        }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    let stars = 0;

    if (percentage === 100) stars = 3;
    else if (percentage >= 75) stars = 2;
    else if (percentage >= 40) stars = 1;

    return {
        score,
        correct,
        incorrect,
        unattempted,
        totalQuestions: questions.length,
        maxScore: questions.length * 4,
        percentage,
        stars,
        maxStreak
    };
};

// Save Quiz Result to Firestore
export const saveQuizResult = async (userId, resultData) => {
    try {
        const resultRef = doc(collection(db, "quiz_results")); // Auto-ID
        await setDoc(resultRef, {
            userId,
            ...resultData,
            timestamp: new Date()
        });
        console.log("Quiz result saved:", resultRef.id);
    } catch (error) {
        console.error("Error saving quiz result:", error);
    }
};

// Save Chapter Progress (Stars, Completes)
export const saveChapterProgress = async (userId, chapterId, progressData) => {
    try {
        // We store progress in a subcollection 'chapterProgress' for the user
        // user -> chapterProgress -> chapterId
        const progRef = doc(db, "users", userId, "chapterProgress", String(chapterId));
        await setDoc(progRef, progressData, { merge: true });
        console.log(`Progress saved for Chapter ${chapterId}`);
    } catch (error) {
        console.error("Error saving chapter progress:", error);
    }
};

// Get All Chapter Progress
export const getUserProgress = async (userId) => {
    try {
        const progressRef = collection(db, "users", userId, "chapterProgress");
        const snapshot = await getDocs(progressRef);
        const progressMap = {};

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                progressMap[doc.id] = doc.data();
            });
        }
        return progressMap;
    } catch (error) {
        console.error("Error fetching progress:", error);
        return {};
    }
};
