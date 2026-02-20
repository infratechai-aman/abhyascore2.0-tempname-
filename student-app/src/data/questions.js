// Helper to generate a pool of 100 mock questions for a given difficulty
export const generateQuestionPool = (subject, chapter, difficulty) => {
    const questions = [];
    const diffMultiplier = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;

    for (let i = 1; i <= 100; i++) {
        questions.push({
            id: `${subject}-${chapter}-${difficulty}-${i}`,
            text: `Question ${i} for ${subject} - ${chapter} (${difficulty.toUpperCase()}) level. Calculate the value of X when...`,
            options: [
                { id: 'A', text: `Option A value ${i * diffMultiplier}` },
                { id: 'B', text: `Option B value ${i * diffMultiplier + 5}` },
                { id: 'C', text: `Option C value ${i * diffMultiplier + 10}` },
                { id: 'D', text: `Option D value ${i * diffMultiplier + 15}` },
            ],
            correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)], // Random correct answer
            explanation: `Detailed solution for question ${i}. The core concept involves applying formula ${i}X...`
        });
    }

    return questions;
};

// Map difficulty to XP rewards
export const DIFFICULTY_REWARDS = {
    easy: { xp: 10, gold: 5 },
    medium: { xp: 25, gold: 15 },
    hard: { xp: 50, gold: 30 }
};
