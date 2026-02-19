import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
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

    questions.forEach(q => {
        const userAns = userAnswers[q.id];

        const correctAnswerVal = q.correctAnswer || q.answer; // Handle both properties
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
        score,
        correct,
        incorrect,
        unattempted,
        totalQuestions: questions.length,
        maxScore: questions.length * 4,
        percentage,
        stars
    };
};
