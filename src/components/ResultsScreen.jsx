import React, { useEffect, useState } from 'react';
import { Trophy, Home, Repeat, Share2, Star, Skull, Zap, Sparkles } from 'lucide-react';
import { calculateResults } from '../utils/gameLogic';

const ResultsScreen = ({ questions, answers, onHome, onRetry }) => {
    const [results, setResults] = useState(null);
    const [showScore, setShowScore] = useState(false);

    // Animation States
    const [displayedScore, setDisplayedScore] = useState(0);
    const [starStates, setStarStates] = useState([0, 0, 0]); // 0: hidden, 1: pop, 2: settle
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        const res = calculateResults(questions, answers);
        setResults(res);

        // Start Sequence
        setTimeout(() => setShowScore(true), 100);
    }, [questions, answers]);

    // Score Counting Animation
    useEffect(() => {
        if (!showScore || !results) return;

        let start = 0;
        const end = results.score;
        const duration = 800; // 0.8s count up (Speed increased)
        const increment = end / (duration / 16); // 60fps

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayedScore(end);
                clearInterval(timer);
                triggerStarSequence(results.stars);
            } else {
                setDisplayedScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [showScore, results]);

    const triggerStarSequence = (earnedStars) => {
        if (earnedStars === 0) {
            setTimeout(() => setShowBreakdown(true), 500);
            return;
        }

        // Pop stars one by one
        let delay = 0;
        for (let i = 0; i < earnedStars; i++) {
            setTimeout(() => {
                setStarStates(prev => {
                    const next = [...prev];
                    next[i] = 1; // Pop
                    return next;
                });

                // Settle after pop
                setTimeout(() => {
                    setStarStates(prev => {
                        const next = [...prev];
                        next[i] = 2; // Settle
                        return next;
                    });
                }, 400);

            }, delay);
            delay += 600; // Next star delay
        }

        // Show rest of UI after stars
        setTimeout(() => setShowBreakdown(true), delay + 200);
    };

    if (!results) return null;

    const percentage = Math.round((results.score / results.maxScore) * 100);

    return (
        <div className="fixed inset-0 z-[70] bg-[#050507]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Rotating Rays Background */}
            {results.stars > 0 && (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                    <div className="w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(250,204,21,0.1)_20deg,transparent_40deg,rgba(250,204,21,0.1)_60deg,transparent_80deg,rgba(250,204,21,0.1)_100deg,transparent_120deg,rgba(250,204,21,0.1)_140deg,transparent_160deg,rgba(250,204,21,0.1)_180deg,transparent_200deg,rgba(250,204,21,0.1)_220deg,transparent_240deg,rgba(250,204,21,0.1)_260deg,transparent_280deg,rgba(250,204,21,0.1)_300deg,transparent_320deg,rgba(250,204,21,0.1)_340deg,transparent_360deg)] animate-spin-slow opacity-30" />
                </div>
            )}

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none" />

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

                {/* Level Complete Text */}
                <div className={`text-center mb-8 transition-all duration-700 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className={`text-5xl font-black italic uppercase tracking-tighter drop-shadow-2xl scale-110 
                        ${results.stars > 0 ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' : 'text-red-500'}`}>
                        {results.stars === 3 ? 'LEGENDARY!' : results.stars === 2 ? 'VICTORY!' : results.stars === 1 ? 'COMPLETED' : 'FAILED'}
                    </h2>
                    <p className={`font-bold uppercase tracking-widest text-xs mt-2 ${results.stars > 0 ? 'text-yellow-200/60' : 'text-red-500/40'}`}>
                        {results.percentage}% ACCURACY
                    </p>
                </div>

                {/* Star Rating Animation Container */}
                <div className="h-32 mb-8 flex justify-center items-center gap-4 relative">
                    {/* Background Glow for Stars */}
                    {results.stars > 0 && <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />}

                    {[0, 1, 2].map((index) => (
                        <div key={index} className="relative w-20 h-20 flex items-center justify-center">
                            {/* Empty Star Slot */}
                            <Star size={64} className="absolute text-white/5" strokeWidth={2} />

                            {/* Animated Star */}
                            <div className={`transition-all duration-500 ease-out-back transform
                                ${starStates[index] === 0 ? 'scale-0 opacity-0 rotate-180' :
                                    starStates[index] === 1 ? 'scale-150 rotate-12' : 'scale-100 rotate-0'}
                            `}>
                                <Star
                                    size={64}
                                    className="fill-yellow-400 text-yellow-200 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] filter brightness-110"
                                    strokeWidth={0}
                                />
                                {starStates[index] >= 1 && (
                                    <Sparkles className="absolute -top-2 -right-2 text-white animate-spin-slow opacity-80" size={24} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Score Counter Card */}
                <div className="bg-[#0c0c10]/80 backdrop-blur border border-white/10 rounded-3xl p-6 w-full mb-6 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mb-1">Total Score</span>
                        <span className="text-6xl font-black italic text-white tracking-tighter tabular-nums drop-shadow-lg">
                            {displayedScore}
                        </span>
                    </div>
                </div>

                {/* Detailed Breakdown (Slide Up) */}
                <div className={`w-full transition-all duration-700 delay-100 ${showBreakdown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-emerald-400 font-black text-xl">{results.correct}</span>
                            <span className="text-[9px] uppercase text-white/30 font-bold">Correct</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-red-400 font-black text-xl">{results.incorrect}</span>
                            <span className="text-[9px] uppercase text-white/30 font-bold">Wrong</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-slate-400 font-black text-xl">{results.unattempted}</span>
                            <span className="text-[9px] uppercase text-white/30 font-bold">Skip</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onHome}
                            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black italic uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Home size={18} className="group-hover:-translate-x-1 transition-transform" /> Home
                        </button>
                        <button
                            onClick={onRetry}
                            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black italic uppercase tracking-wider hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 group"
                        >
                            <Repeat size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsScreen;
