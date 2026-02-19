import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Settings, Lock } from 'lucide-react';

const ChapterMap = ({ selectedSub, chapters, setView, onChapterClick, assets }) => {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on mount (Start at Level 1)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chapters, selectedSub]);

    return (
        <div
            ref={scrollRef}
            className="relative pb-20 animate-in slide-in-from-right duration-300 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar scroll-smooth"
        >
            <div className="flex items-center justify-between px-4 sticky top-0 z-50 bg-[#050507]/95 backdrop-blur-xl border-b border-white/5 py-2 shadow-2xl">
                <button
                    onClick={() => setView('home')}
                    className="p-2 bg-white/5 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-95 backdrop-blur-md"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-black italic text-white uppercase tracking-tighter drop-shadow-md">{selectedSub?.title}</h2>
                    <div className={`h-1 w-12 mx-auto mt-1 rounded-full shadow-[0_0_15px_currentColor] ${selectedSub?.color}`} />
                </div>
                <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-95 backdrop-blur-md">
                    <Settings size={20} />
                </button>
            </div>

            <div className="absolute left-1/2 top-32 bottom-20 w-1 bg-white/5 -translate-x-1/2 rounded-full" />

            <div className="space-y-16 sm:space-y-20 relative mt-8 flex flex-col-reverse pb-32">
                {chapters.map((ch, index) => (
                    <div key={ch.id} className={`flex flex-col items-center relative transition-transform ${ch.pos === 'left' ? '-translate-x-10 sm:-translate-x-12' : ch.pos === 'right' ? 'translate-x-10 sm:translate-x-12' : ''}`}>
                        <div className="relative group">
                            <div
                                onClick={() => onChapterClick && onChapterClick(ch)}
                                className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative z-10 transition-all duration-300 active:scale-90 cursor-pointer hover:scale-105 drop-shadow-2xl`}
                            >
                                {/* Background Asset */}
                                <img
                                    src={ch.locked
                                        ? assets.nodeLocked
                                        : (ch.completedModes && ch.completedModes.length >= 3
                                            ? assets.nodeCompleted
                                            : assets.nodeUnlocked)}
                                    alt={ch.name}
                                    className="absolute inset-0 w-full h-full object-contain"
                                />

                                {/* Chapter ID Overlay */}
                                {!ch.locked && (
                                    <div className="relative z-20 font-black text-2xl sm:text-3xl italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pb-1">
                                        {index + 1}
                                    </div>
                                )}

                                {ch.locked && <Lock size={20} className="relative z-20 text-white/40 drop-shadow-md sm:w-6 sm:h-6" />}

                                {/* Stars Overlay */}
                                {!ch.locked && (
                                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 flex gap-1 z-30">
                                        {[1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[#050507] shadow-lg ${i <= (ch.completedModes?.length || 0) ? 'bg-yellow-400 shadow-[0_0_10px_yellow]' : 'bg-slate-800'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-full mt-2 text-center w-32 left-1/2 -translate-x-1/2 pointer-events-none">
                                <p
                                    className={`text-[8px] sm:text-[9px] font-black italic uppercase tracking-widest px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#050507]/90 border border-white/10 shadow-xl backdrop-blur-sm
                    ${ch.locked ? 'text-white/20' : 'text-blue-400 border-blue-500/30'}`}
                                >
                                    {ch.name}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChapterMap;
