import React from 'react';
import { Star, Trophy, Skull, ArrowRight, BarChart3 } from 'lucide-react';

const SUBJECT_LABELS = {
    phy: 'Physics', chem: 'Chemistry', math: 'Maths',
    bio: 'Biology', zoo: 'Zoology',
};

const BossResults = ({ results, bossName, onDone }) => {
    const { correct, total, scorePercent, stars, analytics } = results;
    const { bySubject, byDifficulty, byChapter } = analytics;

    const getGrade = (pct) => {
        if (pct >= 90) return { label: 'S', color: 'text-yellow-400' };
        if (pct >= 75) return { label: 'A', color: 'text-green-400' };
        if (pct >= 60) return { label: 'B', color: 'text-blue-400' };
        if (pct >= 40) return { label: 'C', color: 'text-amber-400' };
        return { label: 'D', color: 'text-red-400' };
    };

    const grade = getGrade(scorePercent);

    return (
        <div className="fixed inset-0 z-[60] bg-[#050507] text-white overflow-y-auto animate-in fade-in duration-500">
            <div className="max-w-lg mx-auto p-5 pb-24">

                {/* Header */}
                <div className="text-center mb-6 pt-8">
                    <Skull className="mx-auto text-red-500 mb-2" size={36} />
                    <p className="text-[9px] text-red-500/60 font-black uppercase tracking-widest">{bossName}</p>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight mt-1">Battle Complete</h1>
                </div>

                {/* Score Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 text-center">
                    <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3].map(s => (
                            <Star key={s} size={28}
                                className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                        ))}
                    </div>
                    <div className={`text-5xl font-black ${grade.color}`}>{scorePercent}%</div>
                    <div className="text-white/40 text-sm mt-1">{correct} / {total} correct</div>
                    <div className={`inline-block mt-3 px-4 py-1 rounded-full border text-sm font-black ${grade.color} bg-white/5 border-white/10`}>
                        Grade: {grade.label}
                    </div>
                </div>

                {/* Subject Breakdown */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BarChart3 size={14} /> Subject Breakdown
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(bySubject).map(([sub, data]) => {
                            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                            return (
                                <div key={sub} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-white/60 w-20 truncate">{SUBJECT_LABELS[sub] || sub}</span>
                                    <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-white/40 w-12 text-right">{data.correct}/{data.total}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Difficulty Analysis</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['easy', 'medium', 'hard'].map(diff => {
                            const data = byDifficulty[diff] || { correct: 0, total: 0 };
                            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                            return (
                                <div key={diff} className="bg-black/20 rounded-xl p-3 text-center">
                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1
                                        ${diff === 'hard' ? 'text-red-400' : diff === 'medium' ? 'text-amber-400' : 'text-green-400'}`}>
                                        {diff}
                                    </p>
                                    <p className="text-lg font-black text-white">{pct}%</p>
                                    <p className="text-[9px] text-white/30">{data.correct}/{data.total}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chapter Performance */}
                {Object.keys(byChapter).length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Chapter Performance</h3>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {Object.entries(byChapter).map(([chapId, data]) => {
                                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                                return (
                                    <div key={chapId} className="flex items-center gap-2 text-xs">
                                        <span className="flex-1 text-white/40 truncate">{data.name || `Ch.${chapId}`}</span>
                                        <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-white/30 font-mono w-8 text-right">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Done Button */}
                <button
                    onClick={onDone}
                    className="w-full py-4 rounded-2xl bg-red-600 font-black italic text-white uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-900/40"
                >
                    <Trophy size={18} /> Return to Base
                </button>
            </div>
        </div>
    );
};

export default BossResults;
