import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Brain, Lightbulb, Zap, HelpCircle, Delete, Calculator, Lock } from 'lucide-react';
import { XMLParser } from 'fast-xml-parser';

const MathMaze = ({ onExit, userData, assets, updateUserStats }) => {
    // --- Constants ---
    const REVEAL_COST = 100; // Math reveals whole answer, so it's more expensive
    const HINT_COST = 20;
    const REWARD_AMOUNT = 50;
    const FREE_LEVEL_LIMIT = 10;

    // source of truth
    const userGold = userData?.stats?.gold || 0;
    const isPremium = userData?.stats?.isPremium || false;

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [mazes, setMazes] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [gameState, setGameState] = useState('playing'); // playing, solved, complete, premium_locked
    const [showHint, setShowHint] = useState(false);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

    const currentMaze = mazes[currentLevelIndex] || null;
    const currentLevel = currentMaze ? parseInt(currentMaze.id) : currentLevelIndex + 1;

    // --- Load Data ---
    useEffect(() => {
        const fetchMazes = async () => {
            try {
                const response = await fetch('/data/math_riddles.xml');
                if (!response.ok) throw new Error("File not found");
                const xmlText = await response.text();
                const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
                const result = parser.parse(xmlText);

                const data = result.math_riddles?.maze;
                if (data) {
                    setMazes(Array.isArray(data) ? data : [data]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to load math mazes:", err);
                setLoading(false);
            }
        };
        fetchMazes();
    }, []);

    // --- Handlers ---
    const handleNextLevel = () => {
        const nextIndex = currentLevelIndex + 1;

        if (nextIndex >= FREE_LEVEL_LIMIT && !isPremium) {
            setGameState('premium_locked');
            return;
        }

        if (nextIndex < mazes.length) {
            setCurrentLevelIndex(nextIndex);
            setUserInput("");
            setGameState('playing');
            setShowHint(false);
        } else {
            setGameState('complete');
        }
    };

    const handleKeyClick = (key) => {
        if (gameState !== 'playing') return;
        if (userInput.length < 10) {
            setUserInput(prev => prev + key);
        }
    };

    const handleDelete = () => {
        if (gameState !== 'playing') return;
        setUserInput(prev => prev.slice(0, -1));
    };

    const handleSolve = () => {
        if (!currentMaze || gameState !== 'playing') return;
        if (userInput === String(currentMaze.answer)) {
            setGameState('solved');
            updateUserStats({ gold: userGold + REWARD_AMOUNT });
        } else {
            // Shake effect or feedback could go here
            setUserInput("");
        }
    };

    const handleReveal = () => {
        if (userGold >= REVEAL_COST && gameState === 'playing' && currentMaze) {
            setUserInput(String(currentMaze.answer));
            updateUserStats({ gold: userGold - REVEAL_COST });
        }
    };

    const handleUseHint = () => {
        if (userGold >= HINT_COST && !showHint) {
            setShowHint(true);
            updateUserStats({ gold: userGold - HINT_COST });
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[60] bg-[#050805] flex flex-col items-center justify-center font-mono">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#10b981]" />
            <h2 className="text-emerald-500 font-black italic tracking-widest uppercase text-[10px] animate-pulse">Calibrating Sequence...</h2>
        </div>
    );

    if (mazes.length === 0) return (
        <div className="fixed inset-0 z-[60] bg-[#080505] flex flex-col items-center justify-center font-mono p-10 text-center">
            <Calculator size={48} className="text-rose-500 mb-6 animate-bounce" />
            <h2 className="text-white font-black italic text-xl uppercase mb-2">Arithmetic Error</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8">Numerical sequence database not found. Check system integrity.</p>
            <button onClick={() => onExit('minigames')} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl">Return to Hub</button>
        </div>
    );

    if (gameState === 'complete') return (
        <div className="fixed inset-0 z-[60] bg-[#050805] flex flex-col items-center justify-center font-sans p-10 text-center">
            <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_0_30px_#10b98133] animate-bounce">
                <Calculator size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-black italic text-4xl uppercase mb-4 tracking-tighter">Logic Master</h2>
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-12 max-w-sm mx-auto">All numerical patterns solved. Your arithmetic logic is unparalleled.</p>
            <button onClick={() => onExit('minigames')} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl">Return to Hub</button>
        </div>
    );

    if (gameState === 'premium_locked') return (
        <div className="fixed inset-0 z-[60] bg-[#050805] flex flex-col items-center justify-center font-sans p-10 text-center overflow-hidden">
            <div className="relative z-10 max-w-sm">
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
                    <Lock size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-white font-black italic text-3xl uppercase mb-2 tracking-tighter">Advanced Logic Locked</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-8 leading-relaxed">
                    You've solved the basic {FREE_LEVEL_LIMIT} sequences. <br /> Upgrade to Premium to unlock all 100 stages and elite rewards.
                </p>
                <button
                    className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all mb-4 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                    onClick={() => setView('profile')}
                >
                    Upgrade Now
                </button>
                <button onClick={() => onExit('minigames')} className="text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                    Back to Hub
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] bg-[#050805] text-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-emerald-900/20 backdrop-blur-md border-b border-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.3em] text-emerald-500 uppercase">Math Maze</span>
                    <h2 className="text-2xl font-black italic tracking-tighter">STAGE {currentLevel}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Assets</span>
                        <span className="text-xl font-black italic">{userGold}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center px-6 overflow-y-auto pt-8">
                <div className="w-full p-8 bg-black/60 border border-emerald-500/20 rounded-3xl shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em]">Logic Pattern</span>
                        <p className="text-4xl font-black tracking-tighter text-white text-center">
                            {currentMaze?.puzzle}
                        </p>
                    </div>
                </div>

                <div className="w-full h-1 my-8 bg-emerald-500/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-pulse-slow" style={{ width: '100%' }} />
                </div>

                <div className="w-full flex flex-col items-center mb-8">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 opacity-50 italic">Your Solution</div>
                    <div className={`
                        w-full h-20 bg-black/40 border-2 rounded-2xl flex items-center justify-center text-4xl font-black tracking-widest transition-all
                        ${gameState === 'solved' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-white/5 text-white shadow-inner'}
                    `}>
                        {userInput || "?"}
                    </div>
                </div>

                {gameState === 'solved' && (
                    <div className="w-full animate-in slide-in-from-bottom-4 mb-8">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
                            <h3 className="text-emerald-400 font-black italic uppercase tracking-widest text-xs mb-1">Sequence Synced</h3>
                            <p className="text-white/60 text-[10px] mb-4 font-medium italic">{currentMaze?.explanation}</p>
                            <button onClick={handleNextLevel} className="w-full py-4 bg-emerald-500 text-black font-black italic uppercase tracking-widest rounded-xl active:scale-95 shadow-[0_0_20px_#10b98166]">Next Stage</button>
                        </div>
                    </div>
                )}

                {showHint && gameState === 'playing' && (
                    <div className="w-full mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                        <Lightbulb size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-white/70 italic font-medium leading-relaxed">{currentMaze?.hint}</p>
                    </div>
                )}
            </div>

            {/* Input Panel */}
            {gameState === 'playing' && (
                <div className="bg-black/60 backdrop-blur-xl border-t border-white/5 p-6 space-y-4 pb-12">
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', 'DEL'].map((key) => (
                            <button
                                key={key}
                                onClick={() => key === 'DEL' ? handleDelete() : handleKeyClick(String(key))}
                                className={`
                                    h-14 rounded-xl font-black text-lg transition-all active:scale-90 border
                                    ${key === 'DEL' ? 'bg-rose-900/20 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}
                                `}
                            >
                                {key}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={handleUseHint}
                            disabled={userGold < HINT_COST || showHint}
                            className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all ${userGold >= HINT_COST && !showHint ? 'bg-amber-500/5 border-amber-500/20' : 'opacity-20'}`}
                        >
                            <Lightbulb size={20} className="text-amber-500 mb-1" />
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Hint ({HINT_COST})</span>
                        </button>
                        <button
                            onClick={handleReveal}
                            disabled={userGold < REVEAL_COST}
                            className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all ${userGold >= REVEAL_COST ? 'bg-emerald-500/5 border-emerald-500/20' : 'opacity-20'}`}
                        >
                            <Zap size={20} className="text-emerald-500 mb-1" />
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Reveal ({REVEAL_COST})</span>
                        </button>
                        <button
                            onClick={handleSolve}
                            className="bg-emerald-500 text-black font-black italic uppercase tracking-widest text-sm rounded-2xl active:scale-95 shadow-[0_5px_15px_#10b98133]"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => onExit('minigames')}
                className="absolute top-10 right-6 z-[70] p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all active:scale-90"
            >
                <ChevronLeft size={20} />
            </button>
        </div>
    );
};

export default MathMaze;
