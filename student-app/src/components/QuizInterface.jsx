import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight } from 'lucide-react';

const QuizInterface = ({ questions, subject, onComplete, onExit, devMode }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes for 25 questions

    // Safety check if questions array is empty
    if (!questions || questions.length === 0) {
        return <div className="text-white text-center p-10">Loading questions...</div>;
    }

    const currentQ = questions[currentQIndex];

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit on time up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOptionSelect = (optId) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: optId }));
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        onComplete(answers);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050507] flex flex-col text-white animate-in zoom-in-95 duration-300">
            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-[#0c0c10]/95 backdrop-blur shrink-0">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{subject?.title} TEST</span>
                    <span className="text-sm font-black italic uppercase">Q.{currentQIndex + 1} <span className="text-white/30 text-[10px]">/ {questions.length}</span></span>
                </div>

                <div className="flex items-center gap-2 bg-red-900/20 px-3 py-1.5 rounded-full border border-red-500/20">
                    <Timer size={14} className="text-red-400" />
                    <span className="text-xs font-black tabular-nums tracking-wider text-red-400">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/5 shrink-0">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-blue-400 uppercase mb-3 block">
                            QUESTION {currentQIndex + 1}
                        </span>

                        <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight mb-6 sm:mb-8 font-serif tracking-wide">
                            {currentQ.text}
                        </h2>

                        <div className="grid gap-3 sm:gap-4 w-full">
                            {currentQ.options.map((opt, idx) => {
                                const isSelected = answers[currentQ.id] === opt.id;
                                const isCorrect = opt.id === (currentQ.correctAnswer || currentQ.answer);

                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionSelect(opt.id)}
                                        className={`w-full p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.98] group relative overflow-hidden flex items-center min-h-[50px] sm:min-h-[60px]
                                            ${isSelected
                                                ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                                : devMode && isCorrect
                                                    ? 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-black mr-3 sm:mr-4 shrink-0 transition-colors
                                            ${isSelected
                                                ? 'bg-white text-blue-600'
                                                : devMode && isCorrect
                                                    ? 'bg-green-500 text-black'
                                                    : 'bg-black/40 text-white/50 group-hover:bg-white/10 group-hover:text-white'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-sm sm:text-base font-medium leading-snug ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'} ${devMode && isCorrect ? 'text-green-400' : ''}`}>
                                            {opt.text} {devMode && isCorrect && "(CORRECT)"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button
                        onClick={onExit}
                        className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-black italic bg-white/5 border border-white/10 text-white/40 uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors text-sm sm:text-base"
                    >
                        Quit
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-black italic bg-blue-600 text-white uppercase tracking-wider shadow-lg shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-500 text-sm sm:text-base"
                    >
                        {currentQIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizInterface;
