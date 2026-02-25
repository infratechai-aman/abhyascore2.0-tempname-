import React from 'react';
import { Shield, Sword, Skull, X, Star } from 'lucide-react';
import { DIFFICULTY_REWARDS } from '../data/questions';

const LevelSelector = ({ subject, chapter, onClose, onStart }) => {
    const levels = [
        {
            id: 'easy',
            label: 'BASIC',
            icon: <Shield size={32} className="text-emerald-400" />,
            color: 'border-emerald-500/50 bg-emerald-900/20 text-emerald-400',
            desc: 'Fundamental concepts',
            gradient: 'from-emerald-600 to-emerald-900'
        },
        {
            id: 'medium',
            label: 'INTERMEDIATE',
            icon: <Sword size={32} className="text-amber-400" />,
            color: 'border-amber-500/50 bg-amber-900/20 text-amber-400',
            desc: 'Application based',
            gradient: 'from-amber-600 to-amber-900'
        },
        {
            id: 'hard',
            label: 'EXPERT',
            icon: <Skull size={32} className="text-red-400" />,
            color: 'border-red-500/50 bg-red-900/20 text-red-400',
            desc: 'Advanced problem solving',
            gradient: 'from-red-600 to-red-900'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 relative animate-in slide-in-from-bottom duration-300 shadow-2xl">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-[10px] sm:text-xs font-black text-blue-500 tracking-widest uppercase mb-1 sm:mb-2">{subject?.title} • {chapter?.name}</h2>
                    <h3 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tighter">SELECT DIFFICULTY</h3>
                </div>

                <div className="space-y-3 mb-4">
                    {levels.map((lvl) => (
                        <div
                            key={lvl.id}
                            onClick={() => onStart(lvl.id)}
                            className={`relative overflow-hidden group border ${lvl.color} p-3 sm:p-4 rounded-xl cursor-pointer active:scale-95 transition-all hover:bg-white/5`}
                        >
                            <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l ${lvl.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />

                            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                                <div className="p-2 sm:p-3 bg-black/40 rounded-lg border border-white/5 shadow-lg">
                                    {React.cloneElement(lvl.icon, { size: 24, className: lvl.icon.props.className + " sm:w-8 sm:h-8" })}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base sm:text-lg font-black italic tracking-tighter uppercase leading-none mb-0.5 sm:mb-1">{lvl.label}</h4>
                                    <p className="text-[9px] sm:text-[10px] font-medium opacity-60 uppercase tracking-wide leading-tight">{lvl.desc}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {/* Star Rating */}
                                    <div className="flex gap-0.5 mb-1">
                                        {[1, 2, 3].map(i => (
                                            <Star
                                                key={i}
                                                size={10}
                                                className={`${i <= (chapter?.starMap?.[lvl.id] || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[8px] sm:text-[9px] font-bold bg-black/40 px-1.5 sm:px-2 py-0.5 rounded text-white/60 border border-white/5">
                                            +{DIFFICULTY_REWARDS[lvl.id].xp} XP
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] font-bold bg-black/40 px-1.5 sm:px-2 py-0.5 rounded text-yellow-500/80 border border-white/5">
                                            +{DIFFICULTY_REWARDS[lvl.id].gold} G
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LevelSelector;
