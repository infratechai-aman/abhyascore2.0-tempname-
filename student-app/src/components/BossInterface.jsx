import React, { useState, useEffect, useMemo } from 'react';
import { Timer, ArrowRight, ChevronLeft, ChevronRight, Skull } from 'lucide-react';
import { BOSS_DURATION } from '../utils/bossConfig';

const SUBJECT_LABELS = {
    phy: 'Physics', chem: 'Chemistry', math: 'Maths',
    bio: 'Biology', zoo: 'Zoology',
};

const BossInterface = ({ questions, bossName, stream, onComplete, onExit, devMode }) => {
    // Group questions by subject
    const subjectGroups = useMemo(() => {
        const groups = {};
        questions.forEach((q, idx) => {
            const sub = q._subjectCode || q._subject || 'unknown';
            if (!groups[sub]) groups[sub] = [];
            groups[sub].push({ ...q, globalIdx: idx });
        });
        return groups;
    }, [questions]);

    const subjectKeys = Object.keys(subjectGroups);
    const [activeSubject, setActiveSubject] = useState(subjectKeys[0] || '');
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(BOSS_DURATION);
    const [showConfirm, setShowConfirm] = useState(false);

    const currentSubjectQs = subjectGroups[activeSubject] || [];
    const currentQ = currentSubjectQs[currentQIndex];

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete(answers);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleOptionSelect = (optId) => {
        if (!currentQ) return;
        setAnswers(prev => ({ ...prev, [currentQ.id]: optId }));
    };

    const handleNext = () => {
        if (currentQIndex < currentSubjectQs.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            // Move to next subject
            const nextIdx = subjectKeys.indexOf(activeSubject) + 1;
            if (nextIdx < subjectKeys.length) {
                setActiveSubject(subjectKeys[nextIdx]);
                setCurrentQIndex(0);
            } else {
                setShowConfirm(true);
            }
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(prev => prev - 1);
        }
    };

    const totalAnswered = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const timeColor = timeLeft < 600 ? 'text-red-400' : timeLeft < 1800 ? 'text-amber-400' : 'text-green-400';

    if (!currentQ) return <div className="text-white text-center p-10">Loading Boss Battle...</div>;

    return (
        <div className="fixed inset-0 z-[60] bg-[#050507] flex flex-col text-white animate-in zoom-in-95 duration-300">

            {/* Top Bar */}
            <div className="h-14 flex items-center justify-between px-3 border-b border-red-500/20 bg-[#0c0c10]/95 backdrop-blur shrink-0">
                <div className="flex items-center gap-2">
                    <Skull size={16} className="text-red-500" />
                    <div>
                        <span className="text-[9px] text-red-500/60 font-black uppercase tracking-widest">{bossName}</span>
                        <div className="text-[10px] font-bold text-white/40">
                            Q.{currentQIndex + 1}/{currentSubjectQs.length} • {totalAnswered}/{totalQuestions} answered
                        </div>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10`}>
                    <Timer size={13} className={timeColor} />
                    <span className={`text-xs font-black tabular-nums tracking-wider ${timeColor}`}>{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Subject Tabs */}
            <div className="flex border-b border-white/5 bg-[#0a0a0f]/80 shrink-0 overflow-x-auto">
                {subjectKeys.map(sub => {
                    const subQs = subjectGroups[sub];
                    const subAnswered = subQs.filter(q => answers[q.id]).length;
                    const isActive = sub === activeSubject;
                    return (
                        <button
                            key={sub}
                            onClick={() => { setActiveSubject(sub); setCurrentQIndex(0); }}
                            className={`flex-1 min-w-0 py-2.5 px-3 text-center transition-all relative
                                ${isActive ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest block truncate">
                                {SUBJECT_LABELS[sub] || sub}
                            </span>
                            <span className="text-[8px] font-bold text-white/20 mt-0.5 block">
                                {subAnswered}/{subQs.length}
                            </span>
                            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                        </button>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/5 shrink-0">
                <div
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / currentSubjectQs.length) * 100}%` }}
                />
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-28">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black tracking-widest text-red-400 uppercase">
                                {SUBJECT_LABELS[activeSubject]} — Q{currentQIndex + 1}
                            </span>
                            {currentQ._difficulty && (
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border
                                    ${currentQ._difficulty === 'hard' ? 'text-red-400 border-red-500/20 bg-red-500/10'
                                        : currentQ._difficulty === 'medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                                            : 'text-green-400 border-green-500/20 bg-green-500/10'}`}>
                                    {currentQ._difficulty.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-white leading-tight mb-6 font-serif tracking-wide">
                            {currentQ.text}
                        </h2>

                        <div className="grid gap-3 w-full">
                            {currentQ.options.map((opt, idx) => {
                                const isSelected = answers[currentQ.id] === opt.id;
                                const isCorrect = opt.id === currentQ.correctAnswer;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionSelect(opt.id)}
                                        className={`w-full p-3 rounded-xl border text-left transition-all duration-200 active:scale-[0.98] group relative overflow-hidden flex items-center min-h-[50px]
                                            ${isSelected
                                                ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                                                : devMode && isCorrect
                                                    ? 'bg-green-500/20 border-green-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black mr-3 shrink-0
                                            ${isSelected ? 'bg-white text-red-600' : devMode && isCorrect ? 'bg-green-500 text-black' : 'bg-black/40 text-white/50'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                            {opt.text} {devMode && isCorrect && "(CORRECT)"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-2">
                            {SUBJECT_LABELS[activeSubject]} Questions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {currentSubjectQs.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQIndex(idx)}
                                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all
                                        ${idx === currentQIndex
                                            ? 'bg-red-600 text-white'
                                            : answers[q.id]
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                : 'bg-white/5 text-white/20 border border-white/5'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentQIndex === 0}
                        className="px-4 py-3 rounded-xl font-black bg-white/5 border border-white/10 text-white/40 active:scale-95 transition-all disabled:opacity-30"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-3 rounded-xl font-black italic bg-white/5 border border-white/10 text-white/40 uppercase tracking-wider hover:bg-white/10 text-xs"
                    >
                        Submit
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 px-5 py-3 rounded-xl font-black italic bg-red-600 text-white uppercase tracking-wider shadow-lg shadow-red-900/40 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-red-500 text-sm"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Confirm Submit Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#16161c] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                        <Skull className="text-red-500 mx-auto mb-3" size={32} />
                        <h3 className="text-lg font-black text-center uppercase tracking-tight mb-2">Submit Boss Battle?</h3>
                        <p className="text-sm text-white/50 text-center mb-4">
                            You've answered <span className="text-white font-bold">{totalAnswered}</span> of <span className="text-white font-bold">{totalQuestions}</span> questions.
                            {totalAnswered < totalQuestions && (
                                <span className="text-amber-400 block mt-1">
                                    ⚠ {totalQuestions - totalAnswered} questions unanswered!
                                </span>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-white/50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onComplete(answers)}
                                className="flex-1 py-3 rounded-xl bg-red-600 font-black text-white text-sm uppercase tracking-wider"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BossInterface;
