import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, RotateCcw, Home, Brain, Lightbulb, Zap, HelpCircle, Delete, Lock } from 'lucide-react';
import { XMLParser } from 'fast-xml-parser';

const RiddleCipher = ({ onExit, userData, assets, updateUserStats }) => {
    // --- Constants ---
    const REVEAL_COST = 50;
    const HINT_COST = 20;
    const REWARD_AMOUNT = 50;
    const FREE_LEVEL_LIMIT = 10; // First 10 levels are free

    // source of truth for assets
    const userGold = userData?.stats?.gold || 0;
    const isPremium = userData?.stats?.isPremium || false;

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [riddles, setRiddles] = useState([]);
    const [userInput, setUserInput] = useState({}); // { index: char }
    const [gameState, setGameState] = useState('playing'); // playing, solved, complete, premium_locked
    const [showHint, setShowHint] = useState(false);
    const [revealedIndices, setRevealedIndices] = useState([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

    const currentRiddle = riddles[currentLevelIndex] || null;
    const currentLevel = currentRiddle ? parseInt(currentRiddle.id) : currentLevelIndex + 1;

    // --- Matrix Background ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fontSize = 14;
        const columns = width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 5, 10, 0.1)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0f0';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const canvasRef = useRef(null);

    // --- Load Data ---
    useEffect(() => {
        const fetchRiddles = async () => {
            try {
                const response = await fetch('/data/riddles.xml');
                if (!response.ok) throw new Error("File not found");
                const xmlText = await response.text();
                const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
                const result = parser.parse(xmlText);

                const data = result.riddles?.riddle;
                if (data) {
                    setRiddles(Array.isArray(data) ? data : [data]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to load riddles:", err);
                setLoading(false);
            }
        };
        fetchRiddles();
    }, []);

    // --- Handlers ---
    const handleKeyClick = (key) => {
        if (gameState !== 'playing' || !currentRiddle) return;
        const cleanAnswer = String(currentRiddle.answer).toUpperCase().replace(/\s/g, '');

        for (let i = 0; i < cleanAnswer.length; i++) {
            if (!revealedIndices.includes(i) && !userInput[i]) {
                setUserInput(prev => ({ ...prev, [i]: key }));
                break;
            }
        }
    };

    const handleDelete = () => {
        if (gameState !== 'playing') return;

        const filledIndices = Object.keys(userInput)
            .map(Number)
            .filter(idx => !revealedIndices.includes(idx))
            .sort((a, b) => b - a);

        if (filledIndices.length > 0) {
            setUserInput(prev => {
                const newState = { ...prev };
                delete newState[filledIndices[0]];
                return newState;
            });
        }
    };

    const handleSolve = () => {
        if (!currentRiddle || gameState !== 'playing') return;
        const cleanAnswer = String(currentRiddle.answer).toUpperCase().replace(/\s/g, '');

        let finalInput = "";
        for (let i = 0; i < cleanAnswer.length; i++) {
            if (revealedIndices.includes(i)) {
                finalInput += cleanAnswer[i];
            } else {
                finalInput += userInput[i] || "";
            }
        }

        if (finalInput.toUpperCase() === cleanAnswer) {
            setGameState('solved');
            updateUserStats({ gold: userGold + REWARD_AMOUNT });
        }
    };

    const handleNextLevel = () => {
        const nextIndex = currentLevelIndex + 1;

        // Premium Check
        if (nextIndex >= FREE_LEVEL_LIMIT && !isPremium) {
            setGameState('premium_locked');
            return;
        }

        if (nextIndex < riddles.length) {
            setCurrentLevelIndex(nextIndex);
            setUserInput({});
            setGameState('playing');
            setShowHint(false);
            setRevealedIndices([]);
        } else {
            setGameState('complete');
        }
    };

    const revealLetter = () => {
        if (userGold < REVEAL_COST || !currentRiddle || gameState !== 'playing') return;
        const cleanAnswer = String(currentRiddle.answer).toUpperCase().replace(/\s/g, '');

        const available = [];
        for (let i = 0; i < cleanAnswer.length; i++) {
            if (!revealedIndices.includes(i)) available.push(i);
        }

        if (available.length > 0) {
            const randIdx = available[Math.floor(Math.random() * available.length)];
            setRevealedIndices(prev => [...prev, randIdx]);
            updateUserStats({ gold: userGold - REVEAL_COST });
        }
    };

    const handleUseHint = () => {
        if (userGold >= HINT_COST && !showHint) {
            setShowHint(true);
            updateUserStats({ gold: userGold - HINT_COST });
        }
    };

    // --- UI Components ---
    const Keyboard = () => {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
        ];

        return (
            <div className="flex flex-col gap-2 p-4 mt-auto">
                {rows.map((row, i) => (
                    <div key={i} className="flex justify-center gap-1.5">
                        {row.map(key => (
                            <button
                                key={key}
                                onClick={() => key === 'BACK' ? handleDelete() : handleKeyClick(key)}
                                className={`
                                    flex items-center justify-center px-3 py-4 rounded-lg 
                                    font-black border transition-all active:scale-95
                                    ${key === 'BACK'
                                        ? 'bg-purple-900/40 border-purple-500/50 text-purple-200'
                                        : 'bg-black/60 border-blue-500/30 text-white shadow-[0_0_10px_rgba(59,130,246,0.1)]'}
                                `}
                                style={{ minWidth: key === 'BACK' ? '80px' : '36px' }}
                            >
                                {key === 'BACK' ? <Delete size={20} /> : key}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="fixed inset-0 z-[60] bg-[#050508] flex flex-col items-center justify-center font-mono">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-blue-500 font-black italic tracking-widest uppercase text-[10px] animate-pulse">Initializing Cipher...</h2>
        </div>
    );

    if (riddles.length === 0) return (
        <div className="fixed inset-0 z-[60] bg-[#050508] flex flex-col items-center justify-center font-mono p-10 text-center">
            <HelpCircle size={48} className="text-rose-500 mb-6 animate-bounce" />
            <h2 className="text-white font-black italic text-xl uppercase mb-2">Neural Link Failed</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8">Unable to decrypt riddle database. Check your connection or terminal logs.</p>
            <button
                onClick={() => onExit('minigames')}
                className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
            >
                Return to Hub
            </button>
        </div>
    );

    if (gameState === 'complete') return (
        <div className="fixed inset-0 z-[60] bg-[#050508] flex flex-col items-center justify-center font-sans p-10 text-center overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />
            <div className="relative z-10">
                <div className="w-24 h-24 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce">
                    <Brain size={48} className="text-green-400" />
                </div>
                <h2 className="text-white font-black italic text-4xl uppercase mb-4 tracking-tighter">Mission Accomplished</h2>
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-12 max-w-md mx-auto">Neural pathways fully deciphered. You have conquered every riddle in the current database.</p>
                <div className="grid grid-cols-2 gap-4 mb-12">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Total Levels</p>
                        <p className="text-2xl font-black text-white">{riddles.length}</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase mb-1">Final Assets</p>
                        <p className="text-2xl font-black text-amber-500">{userGold}</p>
                    </div>
                </div>
                <button onClick={() => onExit('minigames')} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)]">Return to Hub</button>
            </div>
        </div>
    );

    if (gameState === 'premium_locked') return (
        <div className="fixed inset-0 z-[60] bg-[#050508] flex flex-col items-center justify-center font-sans p-10 text-center overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />
            <div className="relative z-10 max-w-sm">
                <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-pulse">
                    <Lock size={40} className="text-amber-500" />
                </div>
                <h2 className="text-white font-black italic text-3xl uppercase mb-2 tracking-tighter">Premium Access Only</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-8 leading-relaxed">
                    You've mastered the first {FREE_LEVEL_LIMIT} cycles. <br /> Upgrade to Premium to decrypt all 100 levels and access elite rewards.
                </p>
                <button
                    className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all mb-4 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
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
        <div className="fixed inset-0 z-[60] bg-[#050508] text-white flex flex-col font-sans overflow-hidden select-none">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-20 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex flex-col">
                    <h2 className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Riddle Cipher</h2>
                    <span className="text-2xl font-black italic tracking-tighter">STAGE {currentLevel}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Assets</span>
                        <span className="text-xl font-black italic text-white">{userGold}</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/40 rounded-xl flex items-center justify-center">
                        <Brain size={20} className="text-blue-400" />
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center px-6 overflow-y-auto no-scrollbar">
                <div className="w-full mt-4 p-6 bg-blue-900/10 border border-blue-500/20 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                    <p className="text-lg font-medium leading-relaxed text-blue-100 text-center italic">
                        "{currentRiddle?.question}"
                    </p>
                </div>

                <div className="w-32 h-32 my-6 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 border-2 border-blue-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <HelpCircle size={64} className={`
                        transition-all duration-500 
                        ${gameState === 'solved' ? 'text-green-500 scale-110 drop-shadow-[0_0_20px_#22c55e]' : 'text-blue-400 drop-shadow-[0_0_15px_#3b82f6]'}
                    `} />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {currentRiddle?.answer.replace(/\s/g, '').split('').map((char, i) => {
                        const isRev = revealedIndices.includes(i);
                        const userChar = userInput[i];
                        return (
                            <div
                                key={i}
                                className={`
                                    w-10 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all
                                    ${isRev
                                        ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                        : gameState === 'solved'
                                            ? 'bg-green-500/20 border-green-500 text-green-400'
                                            : userChar
                                                ? 'bg-white/5 border-white/20 text-white shadow-[0_0_10px_white/5]'
                                                : 'bg-black/40 border-white/5 text-white/5'}
                                `}
                            >
                                {isRev ? char.toUpperCase() : (userChar || '')}
                            </div>
                        );
                    })}
                </div>

                {gameState === 'solved' && (
                    <div className="w-full mb-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                            <h3 className="text-green-400 font-black italic uppercase tracking-widest text-xs mb-1">Deciphered!</h3>
                            <p className="text-white/80 text-[10px] leading-tight mb-4">{currentRiddle?.explanation}</p>
                            <button
                                onClick={handleNextLevel}
                                className="w-full py-3 bg-green-500 text-black font-black italic uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                            >
                                Next Stage
                            </button>
                        </div>
                    </div>
                )}

                {showHint && gameState === 'playing' && (
                    <div className="w-full mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in zoom-in">
                        <div className="flex items-center gap-2 mb-1">
                            <Lightbulb size={12} className="text-amber-500" />
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Oracle System Hint</span>
                        </div>
                        <p className="text-[10px] text-white/70 italic font-medium">{currentRiddle?.hint}</p>
                    </div>
                )}
            </div>

            {gameState === 'playing' && (
                <div className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/5 flex flex-col">
                    <Keyboard />
                    <div className="grid grid-cols-3 gap-3 p-4 pt-0">
                        <button
                            onClick={handleUseHint}
                            disabled={userGold < HINT_COST || showHint}
                            className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all active:scale-95 ${userGold >= HINT_COST && !showHint ? 'bg-amber-500/5 border-amber-500/20' : 'opacity-30'}`}
                        >
                            <Lightbulb size={20} className="text-amber-500 mb-1" />
                            <span className="text-[8px] font-black text-white/40 uppercase">Hint ({HINT_COST})</span>
                        </button>
                        <button
                            onClick={revealLetter}
                            disabled={userGold < REVEAL_COST}
                            className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all active:scale-95 ${userGold >= REVEAL_COST ? 'bg-emerald-500/5 border-emerald-500/20' : 'opacity-30'}`}
                        >
                            <Zap size={20} className="text-emerald-500 mb-1" />
                            <span className="text-[8px] font-black text-white/40 uppercase">Reveal ({REVEAL_COST})</span>
                        </button>
                        <button
                            onClick={handleSolve}
                            disabled={Object.keys(userInput).length === 0 && revealedIndices.length === 0}
                            className={`
                                flex items-center justify-center bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-sm transition-all active:scale-95 shadow-[0_0_20px_white/20]
                                ${Object.keys(userInput).length === 0 && revealedIndices.length === 0 ? 'opacity-30' : 'hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'}
                            `}
                        >
                            Solve
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

export default RiddleCipher;
