import React from 'react';
import { Skull, Trophy, Lock } from 'lucide-react';
import { getRank } from '../utils/rankUtils';

const Dashboard = ({ subjects, extraCards = [], assets, setSelectedSub, setView, stats }) => {

    const renderCard = (card) => {
        const isLocked = card.locked;
        const isPremiumOnly = card.premiumOnly && !stats.isPremium;

        const handleClick = () => {
            if (isLocked || isPremiumOnly) return;

            if (card.type === 'subject') {
                setSelectedSub(card);
                setView('map');
            } else if (card.type === 'boss') {
                setView('boss-select');
            } else if (card.type === 'achievement') {
                // handle achievements view
            } else if (card.type === 'game_hub') {
                setView('minigames');
            }
        };

        const imageSrc = card.imageUrl || assets[card.assetKey] || card.imageUrl;

        return (
            <div
                key={card.id}
                onClick={handleClick}
                className={`relative rounded-2xl border border-white/10 overflow-hidden active:scale-[0.98] transition-all shadow-xl group bg-slate-900 
                    ${card.type === 'subject' ? 'aspect-[16/11]' : 'h-20'}
                    ${(isLocked || isPremiumOnly) ? 'opacity-70 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {/* Image or Gradient */}
                {imageSrc ? (
                    <img src={imageSrc} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={card.title} />
                ) : (
                    <div className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${card.gradient || 'bg-gradient-to-br from-slate-700 to-black'}`} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className={`absolute inset-0 flex p-3 ${card.type === 'subject' ? 'items-end' : 'items-center px-5 justify-between'}`}>
                    <div className="text-left z-10">
                        <h4 className={`${card.type === 'subject' ? 'text-[12px]' : 'text-lg'} font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-lg`}>
                            {card.title}
                        </h4>
                        <p className={`${card.type === 'subject' ? 'text-[7px]' : 'text-[8px]'} text-white/60 font-medium uppercase tracking-widest mt-1`}>
                            {card.subtitle || card.sub}
                        </p>
                    </div>

                    {/* Icon Overlays */}
                    {card.type === 'boss' && <Skull className="text-red-500/20 rotate-12" size={48} />}
                    {card.type === 'achievement' && <Trophy className="text-amber-500/20 -rotate-12" size={48} />}
                </div>

                {/* Locked Overlay */}
                {(isLocked || isPremiumOnly) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="flex flex-col items-center">
                            <Lock className="text-white/60 mb-1" size={24} />
                            <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">
                                {isPremiumOnly ? 'PREMIUM ONLY' : 'LOCKED'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-2.5 animate-in fade-in duration-500 pb-10">
            {/* Subject Grid */}
            <div className="grid grid-cols-2 gap-2 mt-1">
                {subjects.map(s => renderCard(s))}
            </div>

            {/* Extra Cards (Boss, Achievement, etc.) */}
            {extraCards.map(c => renderCard(c))}

            {/* Default Failbacks if extraCards is empty (unseeded DB) */}
            {extraCards.length === 0 && (
                <>
                    <div onClick={() => setView('boss-select')} className="relative h-20 rounded-2xl border border-white/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-xl group bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-slate-900 transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center px-5 justify-between">
                            <div className="text-left z-10">
                                <h4 className="text-lg font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-lg">BOSS BATTLE</h4>
                                <p className="text-[8px] text-red-500 font-bold tracking-widest uppercase mt-1">JEE / NEET MOCK TEST</p>
                            </div>
                            <Skull className="text-red-500/20 rotate-12" size={48} />
                        </div>
                    </div>

                    <div className="relative h-20 rounded-2xl border border-white/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-xl group bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-slate-900 transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center px-5 justify-between">
                            <div className="text-left z-10">
                                <h4 className="text-lg font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-lg">ACHIEVEMENTS</h4>
                                <p className="text-[8px] text-amber-500 font-bold tracking-widest uppercase mt-1">PROGESS HUB</p>
                            </div>
                            <Trophy className="text-amber-500/20 -rotate-12" size={48} />
                        </div>
                    </div>

                    <div onClick={() => setView('minigames')} className="relative h-20 rounded-2xl border border-white/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-xl group bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-slate-900 transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center px-5 justify-between">
                            <div className="text-left z-10">
                                <h4 className="text-lg font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-lg">MINI-GAMES</h4>
                                <p className="text-[8px] text-indigo-400 font-bold tracking-widest uppercase mt-1">LOGIC & REFLEX TRAINING</p>
                            </div>
                            <Brain className="text-indigo-500/20 rotate-12" size={48} />
                        </div>
                    </div>
                </>
            )}

            {/* Level Bar */}
            {(() => {
                const rank = getRank(stats.lvl);
                const xpPct = Math.min(100, Math.round(((stats.xp || 0) / (stats.nextXp || 100)) * 100));
                return (
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-white/40 uppercase italic leading-none">Level {stats.lvl}</span>
                            <span className={`text-[10px] font-black italic mt-1 uppercase tracking-widest ${rank.color}`}>{rank.title}</span>
                        </div>
                        <div className="flex-1 mx-4 h-2 bg-black/40 rounded-full border border-white/5 p-[1px] overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#10b981] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ width: `${xpPct}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-white/50 italic whitespace-nowrap tracking-wider">{stats.xp} / {stats.nextXp} XP</span>
                    </div>
                );
            })()}
        </div>
    );
};

export default Dashboard;
