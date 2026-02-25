import React from 'react';
import { Lock, Skull, Trophy, ChevronLeft, Swords, Star } from 'lucide-react';
import { BOSSES } from '../utils/bossConfig';
import { checkBossUnlock } from '../utils/bossEngine';

const BossSelection = ({ chapters, subjectCodes, bossHistory, totalXP, onBossSelect, onBack }) => {

    return (
        <div className="min-h-screen bg-[#050507] text-white pb-24 animate-in fade-in duration-500">

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0c0c10]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-2 rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-lg font-black italic uppercase tracking-tight">Boss Battles</h1>
                    <p className="text-[9px] text-white/40 font-bold tracking-widest uppercase">10 Mock Exam Tiers</p>
                </div>
                <Skull className="ml-auto text-red-500/40" size={28} />
            </div>

            {/* Boss List */}
            <div className="p-4 space-y-3">
                {BOSSES.map((boss, idx) => {
                    const unlockInfo = checkBossUnlock(boss, chapters, subjectCodes, bossHistory, totalXP);
                    const attempts = bossHistory.filter(h => h.bossId === boss.id);
                    const bestScore = attempts.length > 0
                        ? Math.max(...attempts.map(a => a.scorePercent || 0))
                        : null;
                    const bestStars = attempts.length > 0
                        ? Math.max(...attempts.map(a => a.stars || 0))
                        : 0;
                    const isFinal = boss.id === 10;

                    return (
                        <div
                            key={boss.id}
                            onClick={() => unlockInfo.unlocked && onBossSelect(boss)}
                            className={`relative rounded-2xl border overflow-hidden transition-all active:scale-[0.98]
                                ${unlockInfo.unlocked
                                    ? isFinal
                                        ? 'border-yellow-500/40 bg-gradient-to-r from-yellow-900/30 via-amber-900/20 to-black cursor-pointer shadow-[0_0_30px_rgba(234,179,8,0.15)]'
                                        : 'border-red-500/20 bg-gradient-to-r from-red-900/20 via-slate-900 to-black cursor-pointer hover:border-red-500/40'
                                    : 'border-white/5 bg-slate-900/50 opacity-60 cursor-not-allowed'
                                }`}
                        >
                            <div className="p-4 flex items-center gap-4">
                                {/* Boss Number */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0
                                    ${unlockInfo.unlocked
                                        ? isFinal ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                                        : 'bg-white/5 text-white/20 border border-white/5'}`}
                                >
                                    {unlockInfo.unlocked ? (isFinal ? '👑' : boss.id) : <Lock size={18} />}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[9px] font-black tracking-widest uppercase
                                        ${isFinal ? 'text-yellow-500' : 'text-red-500/60'}`}>
                                        {boss.subtitle}
                                    </p>
                                    <h3 className={`text-sm font-black italic uppercase tracking-tight truncate
                                        ${unlockInfo.unlocked ? 'text-white' : 'text-white/40'}`}>
                                        {boss.name}
                                    </h3>
                                    <p className="text-[10px] text-white/30 mt-0.5 truncate">
                                        {unlockInfo.unlocked
                                            ? boss.description
                                            : unlockInfo.reason}
                                    </p>
                                </div>

                                {/* Right side: stars or engage */}
                                <div className="shrink-0 text-right">
                                    {unlockInfo.unlocked ? (
                                        bestScore !== null ? (
                                            <div className="flex flex-col items-end">
                                                <div className="flex gap-0.5 mb-1">
                                                    {[1, 2, 3].map(s => (
                                                        <Star key={s} size={12}
                                                            className={s <= bestStars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-white/50">{bestScore}%</span>
                                                <span className="text-[8px] text-white/20">{attempts.length} tries</span>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Swords size={12} /> Engage
                                            </div>
                                        )
                                    ) : (
                                        <Lock size={16} className="text-white/10" />
                                    )}
                                </div>
                            </div>

                            {/* Difficulty indicator bar */}
                            {unlockInfo.unlocked && (
                                <div className="h-1 w-full bg-black/40">
                                    <div
                                        className={`h-full ${isFinal ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-gradient-to-r from-red-600 to-orange-600'}`}
                                        style={{ width: `${Math.min(100, (boss.id / 10) * 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BossSelection;
